"use client";

import {
  Fragment,
  useEffect,
  useMemo,
  useRef,
  useState,
  type DragEvent,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import Link from "next/link";

import { LsIcon } from "@/components/icons/ls-icon";
import { useAiReviewRuntime } from "@/components/providers/ai-review-provider";
import { useProjectStore } from "@/components/providers/project-store-provider";
import { StatusPill } from "@/components/ui/status-pill";
import {
  getInspectableEntry,
  inspectableEntries,
} from "@/domain/workshop/demo-project";
import type {
  AiReviewResponse,
  AiReviewSource,
} from "@/domain/workshop/ai-review-contract";
import { exportProjectMarkdown } from "@/domain/workshop/export-markdown";
import { serializeProjectBundle } from "@/domain/workshop/project-bundle";
import {
  getReviewProvider,
} from "@/domain/workshop/review-provider";
import { buildStructureRecommendations } from "@/domain/workshop/recommendations";
import type {
  ReviewInsight,
  SectionReviewInsight,
  WorkshopReviewInsight,
} from "@/domain/workshop/review";
import { buildPreviewWarnings } from "@/domain/workshop/project-selectors";
import { getRuntimeCapabilities } from "@/domain/workshop/runtime-capabilities";
import { useAiReview } from "@/features/reviews/use-ai-review";
import { downloadFile } from "@/lib/download-file";
import type {
  BlockItem,
  EntryKind,
  InspectableEntry,
  MatchmakerCategory,
  SectionItem,
  SourceStatus,
  StepFlow,
  TransitionItem,
  WorkshopProject,
  WorkshopSection,
} from "@/domain/workshop/types";

type Selection = {
  entryId: string;
  canvasItemId?: string;
  sectionId: string;
};

type DragPayload =
  | {
      type: "library";
      entryId: string;
      previewVariant?: "block";
    }
  | {
      type: "block";
      entryId: string;
      fromSectionId: string;
      itemId: string;
      previewVariant?: "block" | "transition";
    };

type DropTarget = {
  sectionId: string;
  index: number;
};

type PointerPosition = {
  x: number;
  y: number;
};

type InvitationProposal = {
  blockId: string;
  learningPoints: string[];
  needsChange: boolean;
  originalText: string;
  promptLabel: string;
  providerLabel: string;
  rationale: string;
  sectionId: string;
  source: AiReviewSource;
  stepIndex?: number;
  text: string;
  warning: string | null;
};

type BlockReviewSnapshot = {
  itemId: string;
  project: WorkshopProject;
  sectionId: string;
};

type SectionReviewSnapshot = {
  project: WorkshopProject;
  sectionId: string;
};

type LibraryLayout = "list" | "grid";
type InspectorTab = "details" | "checks" | "notes" | "recommendations";

const dragMimeType = "application/x-ls-builder";
const dragPlainPrefix = "ls-builder:";
const timelinePhaseLabels = ["Opening", "Exploration", "Decision", "Closing"];

const inspectorTabs: Array<{
  id: InspectorTab;
  label: string;
}> = [
  { id: "details", label: "Details" },
  { id: "checks", label: "Checks" },
  { id: "notes", label: "Notes" },
  { id: "recommendations", label: "Recommendations" },
];

type LibraryEntry = InspectableEntry & {
  kind: Exclude<EntryKind, "transition">;
};

function isLibraryEntry(entry: InspectableEntry): entry is LibraryEntry {
  return entry.kind !== "transition";
}

const libraryEntries = Object.values(inspectableEntries).filter(isLibraryEntry);

const matchmakerLabels: Record<MatchmakerCategory, string> = {
  share: "Share",
  reveal: "Reveal",
  analyze: "Analyze",
  strategize: "Strategize",
  help: "Help",
  plan: "Plan",
};

const libraryKindLabels: Record<Exclude<EntryKind, "transition">, string> = {
  ls: "Liberating Structure",
  neutral: "Neutral block",
};

const sourceLabels: Record<SourceStatus, string> = {
  official: "Official",
  unofficial: "Unofficial",
  "in-development": "In development",
};

const chainScrollEdgeThreshold = 104;
const chainScrollMaxStep = 24;

function getDayLabels(project: WorkshopProject) {
  const labels = project.sections.map((section) => section.dayLabel || "Day 1");
  return Array.from(new Set(labels));
}

function getNextDayLabel(dayLabels: string[]) {
  const highestDay = dayLabels.reduce((highest, dayLabel) => {
    const match = dayLabel.match(/day\s+(\d+)/i);
    return match ? Math.max(highest, Number(match[1])) : highest;
  }, 0);

  return `Day ${highestDay + 1}`;
}

function normalizeForSearch(value: string) {
  return value.toLowerCase().trim();
}

function buildLibrarySearchText(entry: LibraryEntry) {
  return [
    entry.title,
    entry.shortDescription,
    entry.libraryDescription,
    entry.output,
    entry.typeLabel,
    entry.badge,
    entry.fitCues.join(" "),
    entry.matchmakerCategory ? matchmakerLabels[entry.matchmakerCategory] : "",
    entry.sourceStatus ? sourceLabels[entry.sourceStatus] : "",
  ]
    .join(" ")
    .toLowerCase();
}

function getSectionBlocks(section: WorkshopSection) {
  return section.items.filter((item): item is BlockItem => item.kind === "block");
}

function getSectionTransitions(section: WorkshopSection) {
  return section.items.filter(
    (item): item is TransitionItem => item.kind === "transition",
  );
}

function getTimelinePhaseLabel(index: number) {
  return timelinePhaseLabels[index] ?? `Phase ${index + 1}`;
}

function parseDurationMinutes(durationLabel: string) {
  const match = durationLabel.match(/(\d+)(?:\s*-\s*(\d+))?/);

  if (!match) {
    return 0;
  }

  const start = Number(match[1]);
  const end = match[2] ? Number(match[2]) : start;

  return Math.round((start + end) / 2);
}

function getProjectBuilderStats(project: WorkshopProject) {
  const blocks = project.sections.flatMap(getSectionBlocks);
  const lsCount = blocks.filter(
    (block) => getInspectableEntry(block.entryId).kind === "ls",
  ).length;
  const warningCount =
    blocks.filter((block) => block.warning).length +
    project.sections.filter((section) => section.status === "draft").length;
  const totalMinutes = project.sections.reduce(
    (sum, section) =>
      sum +
      section.items.reduce(
        (sectionSum, item) => sectionSum + parseDurationMinutes(item.durationLabel),
        0,
      ),
    0,
  );

  return {
    blockCount: lsCount,
    totalMinutes,
    warningCount,
  };
}

function getSectionWarningCount(section: WorkshopSection) {
  return (
    getSectionBlocks(section).filter((block) => block.warning).length +
    (section.status === "draft" ? 1 : 0)
  );
}

function getEntryGroupLabel(entry: InspectableEntry) {
  return entry.libraryGroupSize ?? "Group";
}

function withBlockInvitation(
  project: WorkshopProject,
  sectionId: string,
  itemId: string,
  invitation: string,
) {
  return {
    ...project,
    sections: project.sections.map((section) =>
      section.id === sectionId
        ? {
            ...section,
            items: section.items.map((item) =>
              item.kind === "block" && item.id === itemId
                ? {
                    ...item,
                    invitation,
                  }
                : item,
            ),
          }
        : section,
    ),
  } satisfies WorkshopProject;
}

function encodeDragPayload(payload: DragPayload) {
  return JSON.stringify(payload);
}

function decodeDragPayload(raw: string) {
  try {
    return JSON.parse(raw) as DragPayload;
  } catch {
    return null;
  }
}

function decodePlainPayload(raw: string) {
  if (!raw.startsWith(dragPlainPrefix)) {
    return null;
  }

  return decodeDragPayload(raw.slice(dragPlainPrefix.length));
}

function AiSparkIcon() {
  return (
    <svg
      aria-hidden="true"
      className="ai-action-icon"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M12 3.75l1.6 4.15 4.15 1.6-4.15 1.6L12 15.25l-1.6-4.15-4.15-1.6 4.15-1.6L12 3.75Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path
        d="M18.25 14.25l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7.7-1.8ZM5.75 13.75l.55 1.45 1.45.55-1.45.55-.55 1.45-.55-1.45-1.45-.55 1.45-.55.55-1.45Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.6"
      />
    </svg>
  );
}

function SharpenInvitationButton({
  disabled,
  loading,
  onClick,
}: {
  disabled: boolean;
  loading: boolean;
  onClick(): void;
}) {
  return (
    <button
      aria-label="Sharpen invitation"
      className={`ai-icon-button ${loading ? "is-loading" : ""}`}
      disabled={disabled || loading}
      onClick={onClick}
      title="Sharpen invitation"
      type="button"
    >
      <AiSparkIcon />
    </button>
  );
}

function LibraryLayoutIcon({ layout }: { layout: LibraryLayout }) {
  if (layout === "grid") {
    return (
      <svg aria-hidden="true" className="view-toggle-icon" fill="none" viewBox="0 0 24 24">
        <path
          d="M5.25 5.25h5.5v5.5h-5.5v-5.5ZM13.25 5.25h5.5v5.5h-5.5v-5.5ZM5.25 13.25h5.5v5.5h-5.5v-5.5ZM13.25 13.25h5.5v5.5h-5.5v-5.5Z"
          stroke="currentColor"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" className="view-toggle-icon" fill="none" viewBox="0 0 24 24">
      <path
        d="M7.25 6.5h11.5M7.25 12h11.5M7.25 17.5h11.5M4.75 6.5h.01M4.75 12h.01M4.75 17.5h.01"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function LibraryToolIcon({
  tool,
}: {
  tool: "filter" | "pin" | "unpin";
}) {
  if (tool === "filter") {
    return (
      <svg aria-hidden="true" className="library-tool-icon" fill="none" viewBox="0 0 24 24">
        <path
          d="M4.75 6.75h14.5M7.25 12h9.5M10.25 17.25h3.5"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="1.9"
        />
      </svg>
    );
  }

  if (tool === "unpin") {
    return (
      <svg aria-hidden="true" className="library-tool-icon" fill="none" viewBox="0 0 24 24">
        <path
          d="M8.25 4.75h7.5l-1.35 5.1 2.35 2.35v1.3H7.25v-1.3l2.35-2.35-1.35-5.1ZM12 13.5v5.75M5.25 5.25l13.5 13.5"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" className="library-tool-icon" fill="none" viewBox="0 0 24 24">
      <path
        d="M8.25 4.75h7.5l-1.35 5.1 2.35 2.35v1.3H7.25v-1.3l2.35-2.35-1.35-5.1ZM12 13.5v5.75"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function SectionControlIcon({
  icon,
}: {
  icon: "collapse" | "duplicate" | "expand" | "focus" | "review";
}) {
  if (icon === "duplicate") {
    return (
      <svg aria-hidden="true" className="tiny-button-icon" fill="none" viewBox="0 0 24 24">
        <path
          d="M8.25 8.25h8.5v8.5h-8.5v-8.5ZM5.25 5.25h8.5v8.5"
          stroke="currentColor"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
      </svg>
    );
  }

  if (icon === "review") {
    return (
      <svg aria-hidden="true" className="tiny-button-icon" fill="none" viewBox="0 0 24 24">
        <path
          d="M5.25 6.75h13.5M5.25 12h8.5M5.25 17.25h5.25M16.25 15.25l1.15 2.15 2.35 1.1-2.35 1.1-1.15 2.15-1.15-2.15-2.35-1.1 2.35-1.1 1.15-2.15Z"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.7"
        />
      </svg>
    );
  }

  if (icon === "collapse") {
    return (
      <svg aria-hidden="true" className="tiny-button-icon" fill="none" viewBox="0 0 24 24">
        <path
          d="M7.25 14.25 12 9.75l4.75 4.5"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.9"
        />
      </svg>
    );
  }

  if (icon === "expand") {
    return (
      <svg aria-hidden="true" className="tiny-button-icon" fill="none" viewBox="0 0 24 24">
        <path
          d="M7.25 9.75 12 14.25l4.75-4.5"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.9"
        />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" className="tiny-button-icon" fill="none" viewBox="0 0 24 24">
      <path
        d="M12 5.75v12.5M6.75 12h10.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.9"
      />
    </svg>
  );
}

function LibraryMetaIcon({
  type,
}: {
  type: "category" | "duration" | "group";
}) {
  if (type === "duration") {
    return (
      <svg aria-hidden="true" className="library-meta-icon" fill="none" viewBox="0 0 24 24">
        <path
          d="M12 6.25V12l3.45 2.1M19.25 12a7.25 7.25 0 1 1-14.5 0a7.25 7.25 0 0 1 14.5 0Z"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
      </svg>
    );
  }

  if (type === "group") {
    return (
      <svg aria-hidden="true" className="library-meta-icon" fill="none" viewBox="0 0 24 24">
        <path
          d="M8.75 11.25a3 3 0 1 0 0-6a3 3 0 0 0 0 6ZM15.75 10.25a2.5 2.5 0 1 0 0-5a2.5 2.5 0 0 0 0 5ZM4.75 18.75v-.8c0-2.05 1.78-3.7 4-3.7s4 1.65 4 3.7v.8M13.25 17.75v-.45c0-1.55 1.34-2.8 3-2.8s3 1.25 3 2.8v.45"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
      </svg>
    );
  }

  return (
    <span
      aria-hidden="true"
      className="library-category-dot"
    />
  );
}

function getLibraryCategoryLabel(entry: LibraryEntry) {
  return (
    entry.libraryCategoryLabel ??
    (entry.matchmakerCategory ? matchmakerLabels[entry.matchmakerCategory] : entry.typeLabel)
  );
}

function LibraryMetaRow({ entry }: { entry: LibraryEntry }) {
  const duration = entry.libraryDuration ?? entry.libraryMeta?.split("•")[0]?.trim();
  const groupSize = entry.libraryGroupSize ?? "Group";
  const category = getLibraryCategoryLabel(entry);

  return (
    <div className="library-meta-row" aria-label="Structure metadata">
      {duration ? (
        <span className="library-meta-item">
          <LibraryMetaIcon type="duration" />
          {duration}
        </span>
      ) : null}
      <span className="library-meta-item">
        <LibraryMetaIcon type="group" />
        {groupSize}
      </span>
      <span className="library-meta-item library-meta-category">
        <LibraryMetaIcon type="category" />
        {category}
      </span>
    </div>
  );
}

function LibraryDecisionPanel({
  entry,
  review,
}: {
  entry: LibraryEntry;
  review: ReviewInsight;
}) {
  return (
    <div className="library-decision-grid">
      <section className="library-decision-block">
        <span className="library-detail-kicker">Purpose</span>
        <p>{entry.output}</p>
      </section>
      <section className="library-decision-block">
        <span className="library-detail-kicker">Selection cues</span>
        <ul className="library-cue-list">
          {review.fitCues.map((cue) => (
            <li key={cue}>{cue}</li>
          ))}
        </ul>
      </section>
      <section className="library-decision-block library-decision-block-wide">
        <span className="library-detail-kicker">Use when</span>
        <p>{entry.description}</p>
      </section>
    </div>
  );
}

function LibraryStepPreview({ steps }: { steps: StepFlow[] }) {
  return (
    <div className="library-step-preview">
      {steps.map((step, index) => (
        <div key={step.title} className="library-step-preview-item">
          <span className="library-step-number">{index + 1}</span>
          <div>
            <strong>{step.title.replace(/^\d+\.\s*/, "")}</strong>
            <p>{step.prompt ?? step.facilitatorCue}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function getInteractiveTarget(target: EventTarget | null) {
  if (target instanceof Element) {
    return target;
  }

  if (target instanceof Node) {
    return target.parentElement;
  }

  return null;
}

function getInitialSelection(project: { sections: WorkshopSection[] }): Selection {
  const firstSectionWithItems =
    project.sections.find((section) => section.items.length > 0) ?? project.sections[0];
  const firstItem = firstSectionWithItems?.items[0];

  if (!firstSectionWithItems || !firstItem) {
    return {
      entryId: libraryEntries[0]?.id ?? "intro",
      sectionId: project.sections[0]?.id ?? "section-1",
    };
  }

  return {
    entryId: firstItem.entryId,
    canvasItemId: firstItem.id,
    sectionId: firstSectionWithItems.id,
  };
}

function InspectorAccordion({
  children,
  defaultOpen = false,
  summary,
  summaryMeta,
}: {
  children: ReactNode;
  defaultOpen?: boolean;
  summary: string;
  summaryMeta?: string;
}) {
  return (
    <details className="inspector-accordion" open={defaultOpen}>
      <summary className="inspector-accordion-summary">
        <span>{summary}</span>
        {summaryMeta ? (
          <span className="inspector-accordion-meta">{summaryMeta}</span>
        ) : null}
      </summary>
      <div className="inspector-accordion-body">{children}</div>
    </details>
  );
}

export function BuilderScreen() {
  const {
    activeProjectId,
    addSection,
    addBlockToSection,
    duplicateSection,
    moveBlock,
    moveSection,
    project,
    storageMode,
    removeSection,
    removeBlock,
    moveSectionToDay,
    renameDayLabel,
    updateBlockInvitation,
    updateBlockNotes,
    updateBlockStep,
    updateSection,
    updateTransition,
  } = useProjectStore();
  const { runtime: aiReviewRuntime } = useAiReviewRuntime();

  const [activeSectionId, setActiveSectionId] = useState(project.sections[0]?.id ?? "section-1");
  const [selection, setSelection] = useState<Selection>(() => getInitialSelection(project));
  const [dragState, setDragState] = useState<DragPayload | null>(null);
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null);
  const [activePointerId, setActivePointerId] = useState<number | null>(null);
  const [pointerOrigin, setPointerOrigin] = useState<PointerPosition | null>(null);
  const [pointerPosition, setPointerPosition] = useState<PointerPosition | null>(null);
  const [isPointerDragging, setIsPointerDragging] = useState(false);
  const [libraryQuery, setLibraryQuery] = useState("");
  const [libraryLayout, setLibraryLayout] = useState<LibraryLayout>("list");
  const [isLibraryPanelHovered, setIsLibraryPanelHovered] = useState(false);
  const [isLibraryPanelPinned, setIsLibraryPanelPinned] = useState(false);
  const [isLibraryPositionPickerOpen, setIsLibraryPositionPickerOpen] = useState(false);
  const [collapsedSectionIds, setCollapsedSectionIds] = useState<Set<string>>(() => new Set());
  const [inspectorTab, setInspectorTab] = useState<InspectorTab>("details");
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [exportMenuPosition, setExportMenuPosition] = useState<{
    left: number;
    top: number;
    width: number;
  } | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeMatchmakers, setActiveMatchmakers] = useState<MatchmakerCategory[]>([]);
  const [activeKinds, setActiveKinds] = useState<Array<Exclude<EntryKind, "transition">>>([]);
  const [activeSources, setActiveSources] = useState<SourceStatus[]>([]);
  const [openSectionReviewId, setOpenSectionReviewId] = useState<string | null>(null);
  const [isWorkshopReviewOpen, setIsWorkshopReviewOpen] = useState(false);
  const [isSharpeningInvitation, setIsSharpeningInvitation] = useState(false);
  const [invitationProposal, setInvitationProposal] = useState<InvitationProposal | null>(null);
  const [blockReviewSnapshot, setBlockReviewSnapshot] = useState<BlockReviewSnapshot | null>(null);
  const [openSectionReviewSnapshot, setOpenSectionReviewSnapshot] =
    useState<SectionReviewSnapshot | null>(null);
  const [workshopReviewSnapshot, setWorkshopReviewSnapshot] =
    useState<WorkshopProject | null>(null);
  const libraryCardRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const exportButtonRef = useRef<HTMLButtonElement | null>(null);
  const fallbackSection = project.sections[0];
  const reviewProvider = useMemo(() => getReviewProvider(project), [project.aiEnabled]);
  const runtime = useMemo(
    () => getRuntimeCapabilities(project, storageMode, aiReviewRuntime),
    [aiReviewRuntime, project.aiEnabled, storageMode],
  );
  const activeProjectHref = `/project/${encodeURIComponent(activeProjectId)}`;
  const dayLabels = useMemo(() => getDayLabels(project), [project]);

  useEffect(() => {
    if (!isExportMenuOpen) {
      setExportMenuPosition(null);
      return;
    }

    function updateExportMenuPosition() {
      const button = exportButtonRef.current;

      if (!button) {
        return;
      }

      const rect = button.getBoundingClientRect();
      const viewportPadding = 12;
      const viewportWidth = window.innerWidth;
      const availableWidth = Math.max(0, viewportWidth - viewportPadding * 2);
      const menuWidth = Math.min(320, availableWidth);
      const maxLeft = Math.max(viewportPadding, viewportWidth - menuWidth - viewportPadding);
      const left = Math.min(
        Math.max(viewportPadding, rect.right - menuWidth),
        maxLeft,
      );

      setExportMenuPosition({
        left,
        top: rect.bottom + 8,
        width: menuWidth,
      });
    }

    updateExportMenuPosition();
    window.addEventListener("resize", updateExportMenuPosition);
    window.addEventListener("scroll", updateExportMenuPosition, true);

    return () => {
      window.removeEventListener("resize", updateExportMenuPosition);
      window.removeEventListener("scroll", updateExportMenuPosition, true);
    };
  }, [isExportMenuOpen]);

  if (!fallbackSection) {
    return null;
  }

  const activeSection =
    project.sections.find((section) => section.id === activeSectionId) ??
    fallbackSection;

  const selectedCanvasItem = useMemo(() => {
    const section = project.sections.find(
      (candidate) => candidate.id === selection.sectionId,
    );

    return section?.items.find((item) => item.id === selection.canvasItemId);
  }, [project.sections, selection.canvasItemId, selection.sectionId]);

  const selectedSection =
    project.sections.find((section) => section.id === selection.sectionId) ?? activeSection;
  const selectedBlockItem =
    selectedCanvasItem?.kind === "block" ? selectedCanvasItem : null;
  const selectedTransitionItem =
    selectedCanvasItem?.kind === "transition" ? selectedCanvasItem : null;

  useEffect(() => {
    if (!selectedBlockItem) {
      setBlockReviewSnapshot(null);
      return;
    }

    setBlockReviewSnapshot({
      itemId: selectedBlockItem.id,
      project,
      sectionId: selectedSection.id,
    });
  }, [activeProjectId, selectedBlockItem?.id, selectedSection.id]);

  const selectedEntry = getInspectableEntry(selection.entryId);
  const hasLibrarySelection =
    selection.canvasItemId === undefined && selectedEntry.kind !== "transition";
  const selectedLibraryEntry =
    hasLibrarySelection && isLibraryEntry(selectedEntry) ? selectedEntry : null;
  const selectedSteps = selectedBlockItem?.steps?.length
    ? selectedBlockItem.steps
    : selectedEntry.steps;
  const selectedRecommendations = useMemo(
    () =>
      buildStructureRecommendations({
        entry: selectedEntry,
        project,
        section: selectedSection,
        selectedBlock: selectedBlockItem,
      }),
    [project, selectedBlockItem, selectedEntry, selectedSection],
  );
  const selectedPairRecommendations = selectedRecommendations.pairsWellWith;
  const selectedAlternativeRecommendations = selectedRecommendations.useInstead;
  const sectionReviewFallbacks = useMemo(
    () =>
      Object.fromEntries(
        project.sections.map((section) => [section.id, reviewProvider.reviewSection(section)]),
      ) as Record<string, SectionReviewInsight>,
    [project.sections, reviewProvider],
  );
  const openSectionReview =
    openSectionReviewId === null
      ? null
      : project.sections.find((section) => section.id === openSectionReviewId) ?? null;
  const openSectionReviewFallback =
    (openSectionReview ? sectionReviewFallbacks[openSectionReview.id] : null) ??
    sectionReviewFallbacks[activeSection.id] ??
    reviewProvider.reviewSection(activeSection);
  const openSectionReviewRequest =
    openSectionReview &&
    openSectionReviewSnapshot?.sectionId === openSectionReview.id
      ? {
          project: openSectionReviewSnapshot.project,
          sectionId: openSectionReviewSnapshot.sectionId,
          target: "section" as const,
        }
      : null;
  const openSectionReviewState = useAiReview<SectionReviewInsight>({
    enabled: project.aiEnabled && Boolean(openSectionReviewRequest),
    fallbackProviderLabel: runtime.reviewProviderLabel,
    fallbackReview: openSectionReviewFallback,
    request: openSectionReviewRequest,
  });
  const workshopReviewFallback = useMemo(
    () => reviewProvider.reviewWorkshop(project),
    [project, reviewProvider],
  );
  const workshopReviewRequest = workshopReviewSnapshot
    ? {
        project: workshopReviewSnapshot,
        target: "workshop" as const,
      }
    : null;
  const workshopReviewState = useAiReview<WorkshopReviewInsight>({
    enabled: project.aiEnabled && isWorkshopReviewOpen && Boolean(workshopReviewRequest),
    fallbackProviderLabel: runtime.reviewProviderLabel,
    fallbackReview: workshopReviewFallback,
    request: workshopReviewRequest,
  });
  const workshopReview = workshopReviewState.review;
  const selectedReviewFallback = useMemo<ReviewInsight>(
    () =>
      selectedBlockItem
        ? reviewProvider.reviewBlock(selectedSection, selectedBlockItem)
        : selectedTransitionItem
          ? reviewProvider.reviewTransition(selectedSection, selectedTransitionItem)
      : reviewProvider.reviewEntry(selectedEntry.id),
    [reviewProvider, selectedBlockItem, selectedEntry.id, selectedSection, selectedTransitionItem],
  );
  const selectedBlockReviewRequest =
    selectedBlockItem &&
    blockReviewSnapshot?.itemId === selectedBlockItem.id &&
    blockReviewSnapshot.sectionId === selectedSection.id
      ? {
          itemId: blockReviewSnapshot.itemId,
          project: blockReviewSnapshot.project,
          sectionId: blockReviewSnapshot.sectionId,
          target: "block" as const,
        }
      : null;
  const selectedBlockReviewState = useAiReview<ReviewInsight>({
    enabled: project.aiEnabled && Boolean(selectedBlockReviewRequest),
    fallbackProviderLabel: runtime.reviewProviderLabel,
    fallbackReview: selectedReviewFallback,
    request: selectedBlockReviewRequest,
  });
  const selectedReview = selectedBlockItem
    ? selectedBlockReviewState.review
    : selectedReviewFallback;
  const dragPreviewEntry = dragState ? getInspectableEntry(dragState.entryId) : null;
  const draggedSection =
    dragState?.type === "block"
      ? project.sections.find((section) => section.id === dragState.fromSectionId)
      : null;
  const draggedBlockItem =
    dragState?.type === "block"
      ? draggedSection?.items.find(
          (item): item is BlockItem => item.kind === "block" && item.id === dragState.itemId,
        )
      : null;
  const draggedTransitionItem =
    dragState?.type === "block" && dragState.previewVariant === "transition"
      ? getSectionTransitions(draggedSection ?? fallbackSection).find(
          (_item, index) => getSectionBlocks(draggedSection ?? fallbackSection)[index]?.id === dragState.itemId,
        ) ?? null
      : null;
  const normalizedLibraryQuery = normalizeForSearch(libraryQuery);
  const filteredLibraryEntries = useMemo(() => {
    return libraryEntries.filter((entry) => {
      if (activeKinds.length > 0 && !activeKinds.includes(entry.kind)) {
        return false;
      }

      if (
        activeMatchmakers.length > 0 &&
        (!entry.matchmakerCategory || !activeMatchmakers.includes(entry.matchmakerCategory))
      ) {
        return false;
      }

      if (
        activeSources.length > 0 &&
        (!entry.sourceStatus || !activeSources.includes(entry.sourceStatus))
      ) {
        return false;
      }

      if (!normalizedLibraryQuery) {
        return true;
      }

      return buildLibrarySearchText(entry).includes(normalizedLibraryQuery);
    });
  }, [activeKinds, activeMatchmakers, activeSources, normalizedLibraryQuery]);
  const visibleLibraryEntryIds = useMemo(
    () => new Set(filteredLibraryEntries.map((entry) => entry.id)),
    [filteredLibraryEntries],
  );
  const suggestionEntries = useMemo(() => {
    const matches = activeSection.suggestedEntryIds
      .map(getInspectableEntry)
      .filter((entry) => visibleLibraryEntryIds.has(entry.id));

    if (matches.length > 0) {
      return matches;
    }

    return filteredLibraryEntries.slice(0, 2);
  }, [activeSection.suggestedEntryIds, filteredLibraryEntries, visibleLibraryEntryIds]);
  const curatedStartEntries = useMemo(
    () =>
      ["124all", "appreciative", "triz"]
        .map(getInspectableEntry)
        .filter(isLibraryEntry),
    [],
  );
  const hasLibraryFilters =
    normalizedLibraryQuery.length > 0 ||
    activeMatchmakers.length > 0 ||
    activeKinds.length > 0 ||
    activeSources.length > 0;
  const activeFilterCount =
    activeMatchmakers.length + activeKinds.length + activeSources.length;
  const builderStats = useMemo(() => getProjectBuilderStats(project), [project]);
  const previewWarnings = useMemo(() => buildPreviewWarnings(project), [project]);
  const isLibraryPanelOpen =
    isLibraryPanelPinned || isLibraryPanelHovered || dragState?.type === "library";

  useEffect(() => {
    const section = project.sections.find((candidate) => candidate.id === selection.sectionId);

    if (!section) {
      const nextSelection = getInitialSelection(project);
      setActiveSectionId(nextSelection.sectionId);
      setSelection(nextSelection);
      return;
    }

    if (!selection.canvasItemId) {
      return;
    }

    const itemStillExists = section.items.some((item) => item.id === selection.canvasItemId);

    if (!itemStillExists) {
      const nextSelection = getInitialSelection(project);
      setActiveSectionId(nextSelection.sectionId);
      setSelection(nextSelection);
    }
  }, [project, selection.canvasItemId, selection.sectionId]);

  useEffect(() => {
    if (dragState) {
      return;
    }

    setDropTarget(null);
  }, [dragState]);

  useEffect(() => {
    if (activePointerId === null) {
      return;
    }

    function handleWindowPointerMove(event: globalThis.PointerEvent) {
      setPointerPosition({
        x: event.clientX,
        y: event.clientY,
      });

      if (!pointerOrigin || isPointerDragging) {
        return;
      }

      const distance = Math.hypot(
        event.clientX - pointerOrigin.x,
        event.clientY - pointerOrigin.y,
      );

      if (distance > 6) {
        setIsPointerDragging(true);
      }
    }

    function handleWindowPointerUp() {
      clearPointerMoveState();
    }

    window.addEventListener("pointermove", handleWindowPointerMove);
    window.addEventListener("pointerup", handleWindowPointerUp);
    window.addEventListener("pointercancel", handleWindowPointerUp);

    return () => {
      window.removeEventListener("pointermove", handleWindowPointerMove);
      window.removeEventListener("pointerup", handleWindowPointerUp);
      window.removeEventListener("pointercancel", handleWindowPointerUp);
    };
  }, [activePointerId, isPointerDragging, pointerOrigin]);

  function selectCanvasItem(section: WorkshopSection, item: SectionItem) {
    setIsLibraryPositionPickerOpen(false);
    setActiveSectionId(section.id);
    setSelection({
      entryId: item.entryId,
      canvasItemId: item.id,
      sectionId: section.id,
    });
  }

  function selectLibraryEntry(entryId: string) {
    setIsLibraryPositionPickerOpen(false);
    setSelection({
      entryId,
      sectionId: activeSection.id,
    });
  }

  function inspectLibraryEntry(entryId: string) {
    selectLibraryEntry(entryId);
    requestAnimationFrame(() => {
      libraryCardRefs.current[entryId]?.scrollIntoView({
        block: "nearest",
      });
      libraryCardRefs.current[entryId]?.focus();
    });
  }

  function focusLibraryEntry(entryId: string) {
    libraryCardRefs.current[entryId]?.focus();
  }

  function moveLibraryFocus(
    currentEntryId: string,
    direction: "next" | "previous" | "start" | "end",
  ) {
    if (!filteredLibraryEntries.length) {
      return;
    }

    const ids = filteredLibraryEntries.map((entry) => entry.id);
    const currentIndex = ids.indexOf(currentEntryId);

    if (direction === "start") {
      focusLibraryEntry(ids[0]);
      return;
    }

    if (direction === "end") {
      focusLibraryEntry(ids.at(-1) ?? ids[0]);
      return;
    }

    const safeIndex = currentIndex >= 0 ? currentIndex : 0;
    const nextIndex =
      direction === "next"
        ? Math.min(ids.length - 1, safeIndex + 1)
        : Math.max(0, safeIndex - 1);

    focusLibraryEntry(ids[nextIndex]);
  }

  function getQueuedEntryId(section: WorkshopSection) {
    if (hasLibrarySelection) {
      return selectedEntry.id;
    }

    return section.suggestedEntryIds[0] ?? libraryEntries[0]?.id ?? "intro";
  }

  function toggleMatchmaker(category: MatchmakerCategory) {
    setActiveMatchmakers((current) =>
      current.includes(category)
        ? current.filter((value) => value !== category)
        : [...current, category],
    );
  }

  function toggleKind(kind: Exclude<EntryKind, "transition">) {
    setActiveKinds((current) =>
      current.includes(kind)
        ? current.filter((value) => value !== kind)
        : [...current, kind],
    );
  }

  function toggleSource(source: SourceStatus) {
    setActiveSources((current) =>
      current.includes(source)
        ? current.filter((value) => value !== source)
        : [...current, source],
    );
  }

  function clearLibraryFilters() {
    setLibraryQuery("");
    setActiveMatchmakers([]);
    setActiveKinds([]);
    setActiveSources([]);
  }

  function isSectionCollapsed(sectionId: string) {
    return collapsedSectionIds.has(sectionId);
  }

  function toggleSectionCollapsed(sectionId: string) {
    setCollapsedSectionIds((current) => {
      const next = new Set(current);

      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }

      return next;
    });
  }

  function expandSection(sectionId: string) {
    setCollapsedSectionIds((current) => {
      if (!current.has(sectionId)) {
        return current;
      }

      const next = new Set(current);
      next.delete(sectionId);
      return next;
    });
  }

  function handleSectionDragOver(event: DragEvent<HTMLElement>, sectionId: string) {
    const payload = readDragPayload(event);

    if (!payload || !collapsedSectionIds.has(sectionId)) {
      return;
    }

    event.preventDefault();
    expandSection(sectionId);
  }

  function autoScrollChainRow(target: EventTarget | null, clientX: number) {
    const element = getInteractiveTarget(target);
    const chainRow = element?.closest(".chain-row");

    if (!(chainRow instanceof HTMLElement)) {
      return;
    }

    const bounds = chainRow.getBoundingClientRect();
    const distanceFromLeft = clientX - bounds.left;
    const distanceFromRight = bounds.right - clientX;
    let delta = 0;

    if (distanceFromLeft < chainScrollEdgeThreshold) {
      const intensity =
        (chainScrollEdgeThreshold - Math.max(0, distanceFromLeft)) /
        chainScrollEdgeThreshold;
      delta = -Math.ceil(chainScrollMaxStep * intensity);
    } else if (distanceFromRight < chainScrollEdgeThreshold) {
      const intensity =
        (chainScrollEdgeThreshold - Math.max(0, distanceFromRight)) /
        chainScrollEdgeThreshold;
      delta = Math.ceil(chainScrollMaxStep * intensity);
    }

    if (delta !== 0) {
      chainRow.scrollLeft += delta;
    }
  }

  function handleAddBlock(section: WorkshopSection) {
    const entryId = getQueuedEntryId(section);
    const newItemId = addBlockToSection(section.id, entryId);

    setActiveSectionId(section.id);
    expandSection(section.id);

    if (!newItemId) {
      return;
    }

    setSelection({
      entryId,
      canvasItemId: newItemId,
      sectionId: section.id,
    });
  }

  function handleAddSpecificBlock(section: WorkshopSection, entryId: string) {
    const newItemId = addBlockToSection(section.id, entryId);

    setActiveSectionId(section.id);
    expandSection(section.id);

    if (!newItemId) {
      return;
    }

    setSelection({
      entryId,
      canvasItemId: newItemId,
      sectionId: section.id,
    });
  }

  function handleAddSpecificBlockAtPosition(
    section: WorkshopSection,
    entryId: string,
    targetIndex: number,
  ) {
    const newItemId = addBlockToSection(section.id, entryId, targetIndex);

    setIsLibraryPositionPickerOpen(false);
    setActiveSectionId(section.id);
    expandSection(section.id);

    if (!newItemId) {
      return;
    }

    setSelection({
      entryId,
      canvasItemId: newItemId,
      sectionId: section.id,
    });
  }

  function getInsertPositionLabel(section: WorkshopSection, index: number) {
    const blocks = getSectionBlocks(section);

    if (blocks.length === 0) {
      return "First block";
    }

    if (index === 0) {
      return "At start";
    }

    const previousBlock = blocks[index - 1];

    if (!previousBlock) {
      return "At end";
    }

    return `After ${getInspectableEntry(previousBlock.entryId).title}`;
  }

  function readDragPayload(event: DragEvent<HTMLElement>) {
    return (
      dragState ??
      decodeDragPayload(event.dataTransfer.getData(dragMimeType)) ??
      decodePlainPayload(event.dataTransfer.getData("text/plain")) ??
      null
    );
  }

  function setMoveState(payload: DragPayload | null) {
    setDragState(payload);

    if (!payload) {
      setDropTarget(null);
    }
  }

  function commitDrop(section: WorkshopSection, index: number, payload: DragPayload) {
    setActiveSectionId(section.id);
    expandSection(section.id);

    if (payload.type === "library") {
      const newItemId = addBlockToSection(section.id, payload.entryId, index);

      if (newItemId) {
        setSelection({
          entryId: payload.entryId,
          canvasItemId: newItemId,
          sectionId: section.id,
        });
      }

      return;
    }

    const movedItemId = moveBlock(payload.fromSectionId, payload.itemId, section.id, index);

    if (movedItemId) {
      setSelection({
        entryId: payload.entryId,
        canvasItemId: movedItemId,
        sectionId: section.id,
      });
    }
  }

  function handleLibraryDragStart(
    event: DragEvent<HTMLButtonElement>,
    entryId: string,
  ) {
    const payload: DragPayload = {
      type: "library",
      entryId,
      previewVariant: "block",
    };

    setMoveState(payload);
    event.dataTransfer.effectAllowed = "copy";
    event.dataTransfer.setData(dragMimeType, encodeDragPayload(payload));
    event.dataTransfer.setData("text/plain", `${dragPlainPrefix}${encodeDragPayload(payload)}`);
  }

  function handleDragEnd() {
    setActivePointerId(null);
    setMoveState(null);
  }

  function clearPointerMoveState() {
    setActivePointerId(null);
    setPointerOrigin(null);
    setPointerPosition(null);
    setIsPointerDragging(false);
    setMoveState(null);
  }

  function handleCardPointerDown(
    event: PointerEvent<HTMLElement>,
    payload: DragPayload,
  ) {
    if (event.button !== 0) {
      return;
    }

    const target = getInteractiveTarget(event.target);

    if (
      target?.closest(
        "button, textarea, input, select, option, a, [contenteditable='true']",
      )
    ) {
      return;
    }

    event.preventDefault();
    setActivePointerId(event.pointerId);
    setPointerOrigin({
      x: event.clientX,
      y: event.clientY,
    });
    setPointerPosition({
      x: event.clientX,
      y: event.clientY,
    });
    setIsPointerDragging(false);
    setMoveState(payload);
  }

  function handleSlotDragOver(
    event: DragEvent<HTMLElement>,
    sectionId: string,
    index: number,
  ) {
    const payload = readDragPayload(event);

    if (!payload) {
      return;
    }

    event.preventDefault();
    event.dataTransfer.dropEffect = payload.type === "library" ? "copy" : "move";
    autoScrollChainRow(event.currentTarget, event.clientX);

    if (dropTarget?.sectionId !== sectionId || dropTarget.index !== index) {
      setDropTarget({
        sectionId,
        index,
      });
    }
  }

  function handleDropOnSlot(
    event: DragEvent<HTMLElement>,
    section: WorkshopSection,
    index: number,
  ) {
    event.preventDefault();

    const payload = readDragPayload(event);

    if (!payload) {
      return;
    }

    commitDrop(section, index, payload);
    clearPointerMoveState();
  }

  function handleSlotClick(section: WorkshopSection, index: number) {
    if (!dragState || activePointerId !== null) {
      return;
    }

    commitDrop(section, index, dragState);
    clearPointerMoveState();
  }

  function handleSlotPointerEnter(sectionId: string, index: number) {
    if (!dragState || activePointerId === null) {
      return;
    }

    if (dropTarget?.sectionId !== sectionId || dropTarget.index !== index) {
      setDropTarget({
        sectionId,
        index,
      });
    }
  }

  function handleSlotPointerLeave(sectionId: string, index: number) {
    if (
      activePointerId === null ||
      dropTarget?.sectionId !== sectionId ||
      dropTarget.index !== index
    ) {
      return;
    }

    setDropTarget(null);
  }

  function handleChainRowPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!dragState || activePointerId === null) {
      return;
    }

    autoScrollChainRow(event.currentTarget, event.clientX);
  }

  function handleChainRowDragOver(event: DragEvent<HTMLDivElement>) {
    const payload = readDragPayload(event);

    if (!payload) {
      return;
    }

    autoScrollChainRow(event.currentTarget, event.clientX);
  }

  function handleSlotPointerUp(
    event: PointerEvent<HTMLElement>,
    section: WorkshopSection,
    index: number,
  ) {
    if (!dragState || activePointerId === null) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    commitDrop(section, index, dragState);
    clearPointerMoveState();
  }

  function handleRemoveBlock(sectionId: string, itemId: string) {
    removeBlock(sectionId, itemId);
  }

  function handleDuplicateSection(sectionId: string) {
    const duplicatedId = duplicateSection(sectionId);

    if (!duplicatedId) {
      return;
    }

    setActiveSectionId(duplicatedId);
  }

  function handleMoveSection(sectionId: string, direction: "up" | "down") {
    const movedId = moveSection(sectionId, direction);

    if (!movedId) {
      return;
    }

    setActiveSectionId(movedId);
  }

  function handleAddSection() {
    const nextSectionId = addSection();

    if (!nextSectionId) {
      return;
    }

    const nextEntryId =
      selectedEntry.kind === "transition"
        ? (libraryEntries[0]?.id ?? "intro")
        : selectedEntry.id;

    setActiveSectionId(nextSectionId);
    setSelection({
      entryId: nextEntryId,
      sectionId: nextSectionId,
    });
  }

  function handleAddDay() {
    const nextDayLabel = getNextDayLabel(dayLabels);
    const nextSectionId = addSection({
      afterSectionId: project.sections.at(-1)?.id ?? null,
      values: {
        dayLabel: nextDayLabel,
      },
    });

    if (!nextSectionId) {
      return;
    }

    const nextEntryId =
      selectedEntry.kind === "transition"
        ? (libraryEntries[0]?.id ?? "intro")
        : selectedEntry.id;

    setActiveSectionId(nextSectionId);
    setSelection({
      entryId: nextEntryId,
      sectionId: nextSectionId,
    });
  }

  function handleRenameDay(currentDayLabel: string) {
    const nextDayLabel = window.prompt("Rename day", currentDayLabel)?.trim();

    if (!nextDayLabel || nextDayLabel === currentDayLabel) {
      return;
    }

    if (dayLabels.includes(nextDayLabel)) {
      window.alert(`"${nextDayLabel}" already exists. Move sections into it instead.`);
      return;
    }

    renameDayLabel(currentDayLabel, nextDayLabel);
  }

  function handleExportMarkdown() {
    downloadFile(
      exportProjectMarkdown(project),
      `${project.id}-manual.md`,
      "text/markdown;charset=utf-8",
    );
    setIsExportMenuOpen(false);
  }

  function handleExportBundle() {
    downloadFile(
      serializeProjectBundle(project, { exportedFrom: storageMode }),
      `${project.id}.ls-stringsmith.json`,
      "application/json;charset=utf-8",
    );
    setIsExportMenuOpen(false);
  }

  function handleRemoveSection(sectionId: string, sectionTitle: string) {
    if (
      !window.confirm(
        `Delete section \"${sectionTitle}\"? This will remove its local LS chain and transition notes.`,
      )
    ) {
      return;
    }

    const nextSectionId = removeSection(sectionId);

    if (!nextSectionId) {
      return;
    }

    const nextSection =
      project.sections.find((section) => section.id === nextSectionId) ?? project.sections[0];
    const nextEntryId =
      nextSection?.items[0]?.entryId ??
      (selectedEntry.kind === "transition" ? (libraryEntries[0]?.id ?? "intro") : selectedEntry.id);

    setActiveSectionId(nextSectionId);
    setSelection({
      entryId: nextEntryId,
      sectionId: nextSectionId,
    });
  }

  function handleCardKeyDown(
    event: KeyboardEvent<HTMLElement>,
    section: WorkshopSection,
    item: SectionItem,
  ) {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();
    selectCanvasItem(section, item);
  }

  function handleToggleSectionReview(sectionId: string) {
    if (!project.aiEnabled) {
      return;
    }

    if (openSectionReviewId === sectionId) {
      setOpenSectionReviewId(null);
      setOpenSectionReviewSnapshot(null);
      return;
    }

    setOpenSectionReviewId(sectionId);
    setOpenSectionReviewSnapshot({
      project,
      sectionId,
    });
  }

  function handleToggleWorkshopReview() {
    if (!project.aiEnabled) {
      return;
    }

    if (isWorkshopReviewOpen) {
      setIsWorkshopReviewOpen(false);
      setWorkshopReviewSnapshot(null);
      return;
    }

    setWorkshopReviewSnapshot(project);
    setIsWorkshopReviewOpen(true);
  }

  function handleBlockInvitationChange(
    sectionId: string,
    itemId: string,
    invitation: string,
  ) {
    updateBlockInvitation(sectionId, itemId, invitation);
  }

  function commitBlockInvitationReview(
    sectionId: string,
    itemId: string,
    invitation: string,
  ) {
    const nextProject = withBlockInvitation(project, sectionId, itemId, invitation);

    setBlockReviewSnapshot({
      itemId,
      project: nextProject,
      sectionId,
    });

    if (openSectionReviewId === sectionId) {
      setOpenSectionReviewSnapshot({
        project: nextProject,
        sectionId,
      });
    }

    if (isWorkshopReviewOpen) {
      setWorkshopReviewSnapshot(nextProject);
    }
  }

  async function handleSharpenInvitation(options?: {
    promptLabel?: string;
    promptText?: string;
    stepIndex?: number;
  }) {
    if (!project.aiEnabled || !selectedBlockItem || isSharpeningInvitation) {
      return;
    }

    const sectionId = selection.sectionId;
    const blockId = selectedBlockItem.id;
    const originalText = options?.promptText ?? selectedBlockItem.invitation;
    const promptLabel = options?.promptLabel ?? "Working invitation";
    const stepIndex = options?.stepIndex;
    const fallback =
      stepIndex === undefined
        ? reviewProvider.sharpenInvitation(selectedBlockItem)
        : {
            learningPoints: [
              "Keep the current wording visible so you can compare it with the next refinement attempt.",
            ],
            needsChange: false,
            rationale: "Kept the current prompt available because AI refinement was unavailable.",
            text: originalText,
          };

    setIsSharpeningInvitation(true);

    try {
      const response = await fetch("/api/ai-review", {
        body: JSON.stringify({
          itemId: selectedBlockItem.id,
          ...(options?.promptText !== undefined
            ? {
                promptLabel,
                promptText: options.promptText,
              }
            : {}),
          project,
          sectionId: selection.sectionId,
          target: "sharpen-invitation",
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Invitation refinement failed.");
      }

      const payload = (await response.json()) as AiReviewResponse;

      if ("refinement" in payload && payload.refinement) {
        setInvitationProposal({
          blockId,
          learningPoints: payload.refinement.learningPoints,
          needsChange: payload.refinement.needsChange,
          originalText,
          promptLabel,
          providerLabel: payload.providerLabel,
          rationale: payload.refinement.rationale,
          sectionId,
          source: payload.source,
          stepIndex,
          text: payload.refinement.text,
          warning: payload.warning ?? null,
        });
        return;
      }

      setInvitationProposal({
        blockId,
        learningPoints: fallback.learningPoints,
        needsChange: fallback.needsChange,
        originalText,
        promptLabel,
        providerLabel: reviewProvider.label,
        rationale: fallback.rationale,
        sectionId,
        source: "fallback",
        stepIndex,
        text: fallback.text,
        warning: "Invitation refinement returned an invalid response; showing local fallback.",
      });
    } catch {
      setInvitationProposal({
        blockId,
        learningPoints: fallback.learningPoints,
        needsChange: fallback.needsChange,
        originalText,
        promptLabel,
        providerLabel: reviewProvider.label,
        rationale: fallback.rationale,
        sectionId,
        source: "fallback",
        stepIndex,
        text: fallback.text,
        warning: "Invitation refinement provider unavailable; showing local fallback.",
      });
    } finally {
      setIsSharpeningInvitation(false);
    }
  }

  function handleAcceptInvitationProposal() {
    if (!invitationProposal) {
      return;
    }

    if (invitationProposal.stepIndex !== undefined) {
      updateBlockStep(
        invitationProposal.sectionId,
        invitationProposal.blockId,
        invitationProposal.stepIndex,
        {
          prompt: invitationProposal.text,
        },
      );
      setInvitationProposal(null);
      return;
    }

    updateBlockInvitation(
      invitationProposal.sectionId,
      invitationProposal.blockId,
      invitationProposal.text,
    );
    commitBlockInvitationReview(
      invitationProposal.sectionId,
      invitationProposal.blockId,
      invitationProposal.text,
    );
    setInvitationProposal(null);
  }

  function handleDeclineInvitationProposal() {
    setInvitationProposal(null);
  }

  function handleLibraryCardKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    entryId: string,
  ) {
    switch (event.key) {
      case "ArrowDown":
      case "ArrowRight":
        event.preventDefault();
        moveLibraryFocus(entryId, "next");
        return;
      case "ArrowUp":
      case "ArrowLeft":
        event.preventDefault();
        moveLibraryFocus(entryId, "previous");
        return;
      case "Home":
        event.preventDefault();
        moveLibraryFocus(entryId, "start");
        return;
      case "End":
        event.preventDefault();
        moveLibraryFocus(entryId, "end");
        return;
      case "Enter":
      case " ":
        event.preventDefault();
        selectLibraryEntry(entryId);
        return;
      default:
        return;
    }
  }

  return (
    <section className="screen-page screen-page-wide builder-screen">
      <div className="page-header builder-page-header">
        <div>
          <p className="eyebrow">Builder studio</p>
          <h2>Compose the workshop flow.</h2>
          <p className="builder-header-note">
            Arrange sections, refine invitations, and keep the chain easy to scan.
          </p>
        </div>
        <div className="header-actions">
          <Link className="secondary-button" href={`${activeProjectHref}/preview`}>
            Open preview
          </Link>
          <div className="export-menu-wrap">
            <button
              aria-expanded={isExportMenuOpen}
              className="primary-button"
              onClick={() => setIsExportMenuOpen((current) => !current)}
              ref={exportButtonRef}
              type="button"
            >
              Export
            </button>
            {isExportMenuOpen ? (
              <div
                className="export-menu"
                role="menu"
                style={exportMenuPosition ?? undefined}
              >
                <button onClick={handleExportMarkdown} role="menuitem" type="button">
                  <span>Markdown manual</span>
                  <small>Download a facilitation-ready `.md` file.</small>
                </button>
                <button onClick={handleExportBundle} role="menuitem" type="button">
                  <span>Project bundle</span>
                  <small>Download a portable LS Stringsmith project file.</small>
                </button>
                <Link
                  href={`${activeProjectHref}/preview`}
                  onClick={() => setIsExportMenuOpen(false)}
                  role="menuitem"
                >
                  <span>Preview / print PDF</span>
                  <small>Open the run sheet and use browser print.</small>
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div
        className={`builder-layout ${isLibraryPanelOpen ? "is-library-open" : ""} ${
          isLibraryPanelPinned ? "is-library-pinned" : ""
        }`}
      >
        <aside
          className={`paper-surface builder-pane library-panel ${
            isLibraryPanelOpen ? "is-open" : ""
          } ${isLibraryPanelPinned ? "is-pinned" : ""}`}
          onMouseLeave={() => setIsLibraryPanelHovered(false)}
        >
          <div
            aria-hidden={isLibraryPanelOpen}
            className="library-hover-rail"
            onClick={() => setIsLibraryPanelHovered(true)}
            onFocus={() => setIsLibraryPanelHovered(true)}
            onMouseEnter={() => setIsLibraryPanelHovered(true)}
            onMouseMove={() => setIsLibraryPanelHovered(true)}
            onPointerEnter={() => setIsLibraryPanelHovered(true)}
            tabIndex={0}
          >
            <span>Library</span>
          </div>
          <div className="library-panel-content">
              <div className="pane-head">
                <div>
                  <p className="eyebrow">Structure library</p>
                  <h3>Next building piece</h3>
                </div>
                <div className="library-toolbar-actions">
                  <div className="library-view-toggle" aria-label="Library layout">
                    {(["list", "grid"] as LibraryLayout[]).map((layout) => {
                      const layoutLabel = layout === "list" ? "List" : "Icon";

                      return (
                        <button
                          aria-label={`${layoutLabel} view`}
                          className={`library-view-button ${
                            libraryLayout === layout ? "is-active" : ""
                          }`}
                          key={layout}
                          onClick={() => setLibraryLayout(layout)}
                          onPointerDown={() => setLibraryLayout(layout)}
                          title={`${layoutLabel} view`}
                          type="button"
                        >
                          <LibraryLayoutIcon layout={layout} />
                        </button>
                      );
                    })}
                  </div>
                  <button
                    aria-label={
                      activeFilterCount > 0
                        ? `Toggle filters, ${activeFilterCount} active`
                        : "Toggle filters"
                    }
                    className={`library-tool-button ${
                      isFilterOpen || activeFilterCount > 0 ? "is-active" : ""
                    }`}
                    onClick={() => setIsFilterOpen((current) => !current)}
                    title={
                      activeFilterCount > 0
                        ? `Filters (${activeFilterCount} active)`
                        : "Filters"
                    }
                    type="button"
                  >
                    <LibraryToolIcon tool="filter" />
                    {activeFilterCount > 0 ? (
                      <span className="library-tool-badge">{activeFilterCount}</span>
                    ) : null}
                  </button>
                  <button
                    aria-label={
                      isLibraryPanelPinned
                        ? "Unpin structure library"
                        : "Pin structure library"
                    }
                    className={`library-tool-button library-pin-button ${
                      isLibraryPanelPinned ? "is-active" : ""
                    }`}
                    onClick={() => setIsLibraryPanelPinned((current) => !current)}
                    title={
                      isLibraryPanelPinned
                        ? "Unpin structure library"
                        : "Pin structure library"
                    }
                    type="button"
                  >
                    <LibraryToolIcon tool={isLibraryPanelPinned ? "unpin" : "pin"} />
                  </button>
                </div>
              </div>

              <label className="field-group search-field">
            <span>Search structures</span>
            <input
              onChange={(event) => setLibraryQuery(event.target.value)}
              placeholder="Search by name, output, or situation"
              value={libraryQuery}
            />
          </label>

          <p className="library-note">
            Drag from the library or hold a card to move it within the chain.
          </p>

          {isFilterOpen ? (
            <div className="filter-panel">
              <div className="filter-panel-head">
                <p className="eyebrow">Refine results</p>
                {hasLibraryFilters ? (
                  <button className="text-button" onClick={clearLibraryFilters} type="button">
                    Clear all
                  </button>
                ) : null}
              </div>

              <div className="filter-group">
                <span className="filter-group-label">Matchmaker</span>
                <div className="filter-chip-row">
                  {(
                    Object.keys(matchmakerLabels) as MatchmakerCategory[]
                  ).map((category) => (
                    <button
                      key={category}
                      className={`filter-chip ${
                        activeMatchmakers.includes(category) ? "is-active" : ""
                      }`}
                      onClick={() => toggleMatchmaker(category)}
                      type="button"
                    >
                      {matchmakerLabels[category]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="filter-group">
                <span className="filter-group-label">Type</span>
                <div className="filter-chip-row">
                  {(
                    Object.keys(libraryKindLabels) as Array<Exclude<EntryKind, "transition">>
                  ).map((kind) => (
                    <button
                      key={kind}
                      className={`filter-chip ${activeKinds.includes(kind) ? "is-active" : ""}`}
                      onClick={() => toggleKind(kind)}
                      type="button"
                    >
                      {libraryKindLabels[kind]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="filter-group">
                <span className="filter-group-label">Source</span>
                <div className="filter-chip-row">
                  {(Object.keys(sourceLabels) as SourceStatus[]).map((source) => (
                    <button
                      key={source}
                      className={`filter-chip ${activeSources.includes(source) ? "is-active" : ""}`}
                      onClick={() => toggleSource(source)}
                      type="button"
                    >
                      {sourceLabels[source]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {suggestionEntries.length ? (
            <div className="suggestion-strip">
              <div className="suggestion-strip-head">
                <div>
                  <p className="eyebrow">Suggested now</p>
                  <span className="meta-note">for active section</span>
                </div>
                <StatusPill subtle>{activeSection.title}</StatusPill>
              </div>

              <div className="suggestion-stack">
                {suggestionEntries.map((entry, index) => (
                  <button
                    key={entry.id}
                    className={`suggestion-card ${index === 0 ? "is-primary" : ""}`}
                    onClick={() => selectLibraryEntry(entry.id)}
                    type="button"
                  >
                    <span className="suggestion-kicker">
                      {index === 0 ? "Best match" : "Alternative"}
                    </span>
                    <strong>{entry.title}</strong>
                    <p>{entry.libraryDescription}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className={`library-card-stack library-card-stack-${libraryLayout}`}>
            {filteredLibraryEntries.length ? (
              filteredLibraryEntries.map((entry) => {
                const isSelected =
                  selection.canvasItemId === undefined && selection.entryId === entry.id;
                const isSuggested = activeSection.suggestedEntryIds.includes(entry.id);

                return (
                  <button
                    aria-pressed={isSelected}
                    key={entry.id}
                    className={`library-card ${isSelected ? "is-selected" : ""} ${
                      isSuggested ? "is-suggested" : ""
                    }`}
                    draggable
                    onDragEnd={handleDragEnd}
                    onDragStart={(event) => handleLibraryDragStart(event, entry.id)}
                    onKeyDown={(event) => handleLibraryCardKeyDown(event, entry.id)}
                    onClick={() => selectLibraryEntry(entry.id)}
                    ref={(node) => {
                      libraryCardRefs.current[entry.id] = node;
                    }}
                    type="button"
                  >
                    <span className="library-drag-handle" aria-hidden="true">
                      <span />
                      <span />
                      <span />
                    </span>
                    <LsIcon alt={entry.title} icon={entry.icon} />
                    <div className="library-card-copy">
                      <div className="library-title-row">
                        <strong>{entry.title}</strong>
                        <span className="library-card-tags">
                          {isSuggested ? (
                            <span className="library-suggested-tag">Suggested</span>
                          ) : null}
                          {entry.sourceStatus === "in-development" ? (
                            <span className="library-warning-tag">LS in development</span>
                          ) : null}
                        </span>
                      </div>
                      <p>{entry.libraryDescription}</p>
                      <LibraryMetaRow entry={entry} />
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="library-empty-state">
                <strong>No structures match this search.</strong>
                <p>Try a broader term or jump to one of these curated starting points.</p>
                <div className="library-empty-actions">
                  {curatedStartEntries.map((entry) => (
                    <button
                      className="tiny-button"
                      key={entry.id}
                      onClick={() => {
                        clearLibraryFilters();
                        selectLibraryEntry(entry.id);
                      }}
                      type="button"
                    >
                      {entry.title}
                    </button>
                  ))}
                </div>
                {hasLibraryFilters ? (
                  <button className="tiny-button" onClick={clearLibraryFilters} type="button">
                    Clear filters
                  </button>
                ) : null}
              </div>
            )}
              </div>
            </div>
        </aside>

        <section className="canvas-shell">
          <div className="paper-surface builder-utility-bar">
            <div className="utility-purpose-block">
              <span className="eyebrow">Workshop goal</span>
              <strong>{project.globalPurpose}</strong>
            </div>
            <div className="utility-stat-row">
              <span>{builderStats.totalMinutes} min</span>
              <span>{builderStats.blockCount} LS</span>
              <span className={builderStats.warningCount > 0 ? "has-warning" : ""}>
                {builderStats.warningCount} Checks
              </span>
            </div>
            <div className="utility-actions">
              <button
                className="tiny-button"
                disabled={!project.aiEnabled}
                onClick={handleToggleWorkshopReview}
                title={
                  project.aiEnabled
                    ? `Use ${runtime.reviewProviderLabel.toLowerCase()} for a workshop-level review`
                    : runtime.reviewDisabledNote
                }
                type="button"
              >
                {isWorkshopReviewOpen ? "Hide review" : "Review"}
              </button>
              <Link className="primary-button" href={`${activeProjectHref}/preview`}>
                Preview
              </Link>
            </div>
          </div>

          {!project.aiEnabled ? (
            <div className="paper-card review-muted-card">
              <p className="eyebrow">AI assistance paused</p>
              <h4>Reviews and invitation sharpening are off for this project.</h4>
              <p>{runtime.reviewDisabledNote}</p>
            </div>
          ) : null}

          {isWorkshopReviewOpen && project.aiEnabled ? (
            <div className="review-card workshop-review-card">
              <p className="eyebrow review-provider-eyebrow">{workshopReviewState.providerLabel}</p>
              <div className="review-head">
                <StatusPill tone={workshopReview.tone}>{workshopReview.label}</StatusPill>
                <span className="review-score">{workshopReview.score}</span>
              </div>
              <p>{workshopReview.summary}</p>
              {workshopReview.highlights.length ? (
                <div className="review-list-block">
                  <span className="review-list-label">Highlights</span>
                  <ul className="review-list">
                    {workshopReview.highlights.map((highlight) => (
                      <li key={highlight}>{highlight}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {workshopReview.suggestions.length ? (
                <div className="review-list-block">
                  <span className="review-list-label">Suggestions</span>
                  <ul className="review-list">
                    {workshopReview.suggestions.map((suggestion) => (
                      <li key={suggestion}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : null}

          {project.sections.map((section, index) => {
            const sectionReview =
              openSectionReviewId === section.id
                ? openSectionReviewState.review
                : sectionReviewFallbacks[section.id];
            const sectionBlocks = getSectionBlocks(section);
            const sectionWarningCount = getSectionWarningCount(section);
            const sectionCollapsed = isSectionCollapsed(section.id);
            const phaseLabel = getTimelinePhaseLabel(index);

            return (
            <article
              key={section.id}
              className={`paper-surface section-box timeline-phase ${
                section.id === activeSectionId ? "is-active" : ""
              } ${sectionCollapsed ? "is-collapsed" : ""}`}
              onDragOver={(event) => handleSectionDragOver(event, section.id)}
            >
              {index === 0 || project.sections[index - 1]?.dayLabel !== section.dayLabel ? (
                <div className="day-band">
                  <span className="day-chip">{section.dayLabel}</span>
                  <button
                    className="day-action-button"
                    onClick={() => handleRenameDay(section.dayLabel)}
                    type="button"
                  >
                    Rename day
                  </button>
                </div>
              ) : null}

              <div className="section-header">
                <div>
                  <p className="section-kicker">
                    {phaseLabel} · Section {section.indexLabel}
                  </p>
                  {section.id === activeSectionId ? (
                    <div className="section-edit-stack">
                      <input
                        className="section-title-input"
                        onChange={(event) =>
                          updateSection(section.id, { title: event.target.value })
                        }
                        value={section.title}
                      />
                      <textarea
                        className="section-subgoal-input"
                        onChange={(event) =>
                          updateSection(section.id, { subgoal: event.target.value })
                        }
                        rows={2}
                        value={section.subgoal}
                      />
                    </div>
                  ) : (
                    <>
                      <h3>{section.title}</h3>
                      <p className="section-subgoal">{section.subgoal}</p>
                    </>
                  )}
                </div>
                <div className="section-meta">
                  <div className="section-meta-group section-meta-group-actions">
                    <div className="section-tools">
                      <button
                        aria-label={`Move ${section.title} up`}
                        className="tiny-button section-icon-button"
                        disabled={index === 0}
                        onClick={() => handleMoveSection(section.id, "up")}
                        title="Move section up"
                        type="button"
                      >
                        ↑
                      </button>
                      <button
                        aria-label={`Move ${section.title} down`}
                        className="tiny-button section-icon-button"
                        disabled={index === project.sections.length - 1}
                        onClick={() => handleMoveSection(section.id, "down")}
                        title="Move section down"
                        type="button"
                      >
                        ↓
                      </button>
                      <button
                        aria-label={`Duplicate ${section.title}`}
                        className="tiny-button section-icon-button"
                        onClick={() => handleDuplicateSection(section.id)}
                        title="Duplicate section"
                        type="button"
                      >
                        <SectionControlIcon icon="duplicate" />
                      </button>
                      <button
                        aria-label={`Delete ${section.title}`}
                        className="tiny-button tiny-button-danger section-icon-button"
                        disabled={project.sections.length <= 1}
                        onClick={() => handleRemoveSection(section.id, section.title)}
                        title="Delete section"
                        type="button"
                      >
                        <svg
                          aria-hidden="true"
                          className="tiny-button-icon"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <path
                            d="M9 4.75h6M5.75 7.25h12.5M10 10.25v6.5M14 10.25v6.5M7.75 7.25l.6 9.15a2 2 0 0 0 2 1.85h3.3a2 2 0 0 0 2-1.85l.6-9.15"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.8"
                          />
                        </svg>
                      </button>
                      {section.id !== activeSectionId ? (
                        <button
                          aria-label={`Focus ${section.title}`}
                          className="tiny-button section-icon-button"
                          onClick={() => setActiveSectionId(section.id)}
                          title="Focus section"
                          type="button"
                        >
                          <SectionControlIcon icon="focus" />
                        </button>
                      ) : null}
                    </div>
                  </div>
                  <div className="section-meta-group section-meta-group-info">
                    <div className="section-info-pills" aria-label="Section details">
                      <span className="phase-summary-pill">{phaseLabel}</span>
                      {section.id === activeSectionId ? (
                        <select
                          aria-label={`Move ${section.title} to day`}
                          className="section-day-select"
                          onChange={(event) =>
                            moveSectionToDay(section.id, event.target.value)
                          }
                          value={section.dayLabel}
                        >
                          {dayLabels.map((dayLabel) => (
                            <option key={dayLabel} value={dayLabel}>
                              {dayLabel}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="meta-pill">{section.dayLabel}</span>
                      )}
                      {section.id === activeSectionId ? (
                        <input
                          className="section-time-input"
                          onChange={(event) =>
                            updateSection(section.id, { timeRange: event.target.value })
                          }
                          placeholder="09:30 - 11:00"
                          value={section.timeRange ?? ""}
                        />
                      ) : section.timeRange ? (
                        <span className="meta-pill">{section.timeRange}</span>
                      ) : null}
                      <span className="meta-pill">{section.totalLabel}</span>
                      {sectionWarningCount > 0 ? (
                        <span className="phase-warning-pill">{sectionWarningCount} check</span>
                      ) : null}
                    </div>
                    <div className="section-inline-actions" aria-label="Section actions">
                      <button
                        aria-label={
                          openSectionReviewId === section.id
                            ? `Hide review for ${section.title}`
                            : `Review ${section.title}`
                        }
                        className="tiny-button section-icon-button section-review-trigger"
                        disabled={!project.aiEnabled}
                        onClick={() => handleToggleSectionReview(section.id)}
                        title={openSectionReviewId === section.id ? "Hide review" : "Review section"}
                        type="button"
                      >
                        <SectionControlIcon icon="review" />
                      </button>
                      <button
                        aria-expanded={!sectionCollapsed}
                        aria-label={
                          sectionCollapsed
                            ? `Open ${section.title}`
                            : `Collapse ${section.title}`
                        }
                        className="tiny-button section-icon-button"
                        onClick={() => toggleSectionCollapsed(section.id)}
                        title={sectionCollapsed ? "Open section" : "Collapse section"}
                        type="button"
                      >
                        <SectionControlIcon icon={sectionCollapsed ? "expand" : "collapse"} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {openSectionReviewId === section.id && project.aiEnabled ? (
                <div className="review-card section-review-card">
                  <div className="review-head">
                    <StatusPill tone={sectionReview.tone}>
                      {sectionReview.label}
                    </StatusPill>
                    <span className="review-score">{sectionReview.score}</span>
                  </div>
                  <p>{sectionReview.summary}</p>
                  {sectionReview.highlights.length ? (
                    <div className="review-list-block">
                      <span className="review-list-label">Highlights</span>
                      <ul className="review-list">
                        {sectionReview.highlights.map((highlight) => (
                          <li key={highlight}>{highlight}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  {sectionReview.suggestions.length ? (
                    <div className="review-list-block">
                      <span className="review-list-label">Suggestions</span>
                      <ul className="review-list">
                        {sectionReview.suggestions.map((suggestion) => (
                          <li key={suggestion}>{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              ) : null}

              {section.items.length > 0 ? (
                !sectionCollapsed ? (
                  <div
                    className="chain-row"
                    onDragOver={handleChainRowDragOver}
                    onPointerMove={handleChainRowPointerMove}
                  >
                    <div
                      className={`drop-slot ${
                        dragState ? "is-visible" : ""
                      } ${
                        dropTarget?.sectionId === section.id && dropTarget.index === 0
                          ? "is-active"
                          : ""
                      }`}
                      onClick={() => handleSlotClick(section, 0)}
                      onPointerEnter={() => handleSlotPointerEnter(section.id, 0)}
                      onPointerLeave={() => handleSlotPointerLeave(section.id, 0)}
                      onPointerUp={(event) => handleSlotPointerUp(event, section, 0)}
                      onDragOver={(event) => handleSlotDragOver(event, section.id, 0)}
                      onDrop={(event) => handleDropOnSlot(event, section, 0)}
                    >
                      <span>Place</span>
                    </div>

                    {sectionBlocks.map((item, index) => {
                      const entry = getInspectableEntry(item.entryId);
                      const transition = getSectionTransitions(section)[index];
                      const isSelected = selection.canvasItemId === item.id;

                      return (
                        <Fragment key={item.id}>
                          <article
                            className={`block-card ${item.accent ? "is-accent" : ""} ${
                              isSelected ? "is-selected" : ""
                            } ${
                              dropTarget?.sectionId === section.id && dropTarget.index === index
                                ? "is-drop-target"
                                : ""
                            } ${
                              dragState?.type === "block" &&
                              dragState.itemId === item.id &&
                              dragState.previewVariant !== "transition" &&
                              isPointerDragging
                                ? "is-drag-source"
                                : ""
                            }`}
                            onPointerDown={(event) =>
                              handleCardPointerDown(event, {
                                type: "block",
                                entryId: item.entryId,
                                fromSectionId: section.id,
                                itemId: item.id,
                                previewVariant: "block",
                              })
                            }
                            onDragOver={(event) => handleSlotDragOver(event, section.id, index)}
                            onDrop={(event) => handleDropOnSlot(event, section, index)}
                            onClick={() => selectCanvasItem(section, item)}
                          >
                            <div className="block-card-actions">
                              <button
                                aria-label={`Remove ${entry.title}`}
                                className="block-remove-button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  handleRemoveBlock(section.id, item.id);
                                }}
                                type="button"
                              >
                                <svg
                                  aria-hidden="true"
                                  className="block-remove-icon"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    d="M9 4.75h6M5.75 7.25h12.5M10 10.25v6.5M14 10.25v6.5M7.75 7.25l.6 9.15a2 2 0 0 0 2 1.85h3.3a2 2 0 0 0 2-1.85l.6-9.15"
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="1.8"
                                  />
                                </svg>
                              </button>
                            </div>

                            <div className="block-top">
                              <LsIcon alt={entry.title} icon={entry.icon} />
                              <div>
                                <div className="block-title-line">
                                  <strong>{entry.title}</strong>
                                  {item.warning ? (
                                    <span className="block-check-marker">Check</span>
                                  ) : null}
                                </div>
                                <div className="block-meta">
                                  {item.durationLabel} · {getEntryGroupLabel(entry)} ·{" "}
                                  {entry.libraryCategoryLabel ?? entry.typeLabel}
                                </div>
                              </div>
                            </div>
                            <div className="block-invitation-preview">
                              <span>Purpose</span>
                              <p>{entry.libraryDescription ?? entry.shortDescription}</p>
                            </div>
                          </article>

                          {transition ? (
                            <article
                              className={`transition-card ${
                                selection.canvasItemId === transition.id ? "is-selected" : ""
                              } ${
                                dropTarget?.sectionId === section.id &&
                                dropTarget.index === index + 1
                                  ? "is-drop-target"
                                  : ""
                              } ${
                                dragState?.type === "block" &&
                                dragState.itemId === item.id &&
                                dragState.previewVariant === "transition" &&
                                isPointerDragging
                                  ? "is-drag-source"
                                  : ""
                              }`}
                              onPointerDown={(event) =>
                                handleCardPointerDown(event, {
                                  type: "block",
                                  entryId: item.entryId,
                                  fromSectionId: section.id,
                                  itemId: item.id,
                                  previewVariant: "transition",
                                })
                              }
                              onDragOver={(event) =>
                                handleSlotDragOver(event, section.id, index + 1)
                              }
                              onDrop={(event) => handleDropOnSlot(event, section, index + 1)}
                              onClick={() => selectCanvasItem(section, transition)}
                              onKeyDown={(event) => handleCardKeyDown(event, section, transition)}
                              role="button"
                              tabIndex={0}
                            >
                              <div className="transition-card-head">
                                <span className="transition-bridge-pill">
                                  <svg
                                    aria-hidden="true"
                                    className="transition-bridge-icon"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      d="M4.75 12h4.5m5.5 0h4.5M9.25 12a2.75 2.75 0 1 1 5.5 0a2.75 2.75 0 1 1-5.5 0Z"
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="1.8"
                                    />
                                  </svg>
                                  Bridge
                                </span>
                                {selection.canvasItemId === transition.id ? (
                                  <input
                                    aria-label="Transition duration"
                                    className="transition-duration-input"
                                    onChange={(event) =>
                                      updateTransition(section.id, transition.id, {
                                        durationLabel: event.target.value,
                                      })
                                    }
                                    value={transition.durationLabel}
                                  />
                                ) : (
                                  <span className="transition-time">
                                    {transition.durationLabel}
                                  </span>
                                )}
                              </div>
                              {selection.canvasItemId === transition.id ? (
                                <textarea
                                  aria-label="Transition bridge note"
                                  className="transition-note-editor"
                                  onChange={(event) =>
                                    updateTransition(section.id, transition.id, {
                                      note: event.target.value,
                                    })
                                  }
                                  rows={4}
                                  value={transition.note}
                                />
                              ) : (
                                <p className="transition-note">{transition.note}</p>
                              )}
                            </article>
                          ) : null}

                          <div
                            className={`drop-slot ${
                              dragState ? "is-visible" : ""
                            } ${
                              dropTarget?.sectionId === section.id &&
                              dropTarget.index === index + 1
                                ? "is-active"
                                : ""
                            }`}
                            onClick={() => handleSlotClick(section, index + 1)}
                            onPointerEnter={() =>
                              handleSlotPointerEnter(section.id, index + 1)
                            }
                            onPointerLeave={() =>
                              handleSlotPointerLeave(section.id, index + 1)
                            }
                            onPointerUp={(event) =>
                              handleSlotPointerUp(event, section, index + 1)
                            }
                            onDragOver={(event) =>
                              handleSlotDragOver(event, section.id, index + 1)
                            }
                            onDrop={(event) => handleDropOnSlot(event, section, index + 1)}
                          >
                            <span>Place</span>
                          </div>
                        </Fragment>
                      );
                    })}

                    <button
                      className={`ghost-add-card ${
                        dropTarget?.sectionId === section.id &&
                        dropTarget.index === sectionBlocks.length
                          ? "is-drop-target"
                          : ""
                      }`}
                      onPointerEnter={() =>
                        handleSlotPointerEnter(section.id, sectionBlocks.length)
                      }
                      onPointerLeave={() =>
                        handleSlotPointerLeave(section.id, getSectionBlocks(section).length)
                      }
                      onPointerUp={(event) =>
                        handleSlotPointerUp(
                          event,
                          section,
                          sectionBlocks.length,
                        )
                      }
                      onDragOver={(event) =>
                        handleSlotDragOver(event, section.id, sectionBlocks.length)
                      }
                      onDrop={(event) =>
                        handleDropOnSlot(event, section, sectionBlocks.length)
                      }
                      onClick={() => handleAddBlock(section)}
                      type="button"
                    >
                      <span className="ghost-plus">+</span>
                      <strong>Add {getInspectableEntry(getQueuedEntryId(section)).title}</strong>
                      <p>
                        {hasLibrarySelection
                          ? "Use the selected library block in this section."
                          : "Quick-add the strongest suggested next block."}
                      </p>
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="section-collapsed-summary">
                      <div>
                        <strong>{section.title}</strong>
                        <p>{section.totalLabel}</p>
                      </div>
                      {sectionWarningCount > 0 ? (
                        <span className="phase-warning-pill">{sectionWarningCount} check</span>
                      ) : null}
                    </div>
                    {section.miniPreviewEntryIds?.length ? (
                      <div className="mini-preview-row">
                        {section.miniPreviewEntryIds.map((entryId) => {
                          const miniEntry = getInspectableEntry(entryId);
                          const matchingItem = section.items.find(
                            (item) => item.entryId === entryId,
                          );

                          return (
                            <button
                              key={entryId}
                              className="mini-preview-card"
                              onClick={() => {
                                if (matchingItem) {
                                  selectCanvasItem(section, matchingItem);
                                }
                              }}
                              type="button"
                            >
                              {miniEntry.title}
                            </button>
                          );
                        })}
                      </div>
                    ) : null}
                    <div
                      className={`section-action-row section-drop-zone ${
                        dragState ? "is-visible" : ""
                      } ${
                        dropTarget?.sectionId === section.id &&
                        dropTarget.index === sectionBlocks.length
                          ? "is-active"
                          : ""
                      }`}
                      onPointerEnter={() =>
                        handleSlotPointerEnter(section.id, sectionBlocks.length)
                      }
                      onPointerLeave={() =>
                        handleSlotPointerLeave(section.id, getSectionBlocks(section).length)
                      }
                      onPointerUp={(event) =>
                        handleSlotPointerUp(
                          event,
                          section,
                          sectionBlocks.length,
                        )
                      }
                      onDragOver={(event) =>
                        handleSlotDragOver(event, section.id, sectionBlocks.length)
                      }
                      onDrop={(event) =>
                        handleDropOnSlot(event, section, sectionBlocks.length)
                      }
                    >
                      <button
                        className="section-add-button"
                        onClick={() => handleAddBlock(section)}
                        type="button"
                      >
                        Add {getInspectableEntry(getQueuedEntryId(section)).title}
                      </button>
                      {dragState ? <span className="section-drop-hint">Drop at end</span> : null}
                    </div>
                  </>
                )
              ) : (
                <div
                  className={`draft-callout section-drop-zone ${
                    dragState ? "is-visible" : ""
                  } ${
                    dropTarget?.sectionId === section.id && dropTarget.index === 0
                      ? "is-active"
                      : ""
                  }`}
                  onPointerEnter={() => handleSlotPointerEnter(section.id, 0)}
                  onPointerLeave={() => handleSlotPointerLeave(section.id, 0)}
                  onPointerUp={(event) => handleSlotPointerUp(event, section, 0)}
                  onDragOver={(event) => handleSlotDragOver(event, section.id, 0)}
                  onDrop={(event) => handleDropOnSlot(event, section, 0)}
                >
                  <strong>Draft section</strong>
                  <p>
                    Planned shape: short input -&gt; agreement-making structure
                    -&gt; closing reflection.
                  </p>
                  <button
                    className="section-add-button"
                    onClick={() => handleAddBlock(section)}
                    type="button"
                  >
                    Add {getInspectableEntry(getQueuedEntryId(section)).title}
                  </button>
                  {dragState ? <span className="section-drop-hint">Drop first block here</span> : null}
                </div>
              )}
            </article>
            );
          })}

          <div className="section-create-row">
            <button
              className="section-create-card"
              onClick={handleAddSection}
              type="button"
            >
              <span className="section-create-plus">+</span>
              <strong>Add section</strong>
              <p>Start a fresh module with its own subgoal and local LS chain.</p>
            </button>
            <button
              className="section-create-card"
              onClick={handleAddDay}
              type="button"
            >
              <span className="section-create-plus">+</span>
              <strong>Add day</strong>
              <p>Create a new day lane with its first draft section.</p>
            </button>
          </div>
        </section>

        <aside className="paper-surface builder-pane inspector-pane">
          <div className="pane-head">
            <div>
              <p className="eyebrow">Inspector</p>
              <h3>{selectedEntry.title}</h3>
              <p className="inspector-meta-line">{selectedEntry.badge}</p>
            </div>
          </div>

          <div className="inspector-tab-list" role="tablist" aria-label="Inspector tabs">
            {inspectorTabs.map((tab) => (
              <button
                aria-selected={inspectorTab === tab.id}
                className={`inspector-tab ${inspectorTab === tab.id ? "is-active" : ""}`}
                key={tab.id}
                onClick={() => setInspectorTab(tab.id)}
                role="tab"
                type="button"
              >
                {tab.label}
              </button>
            ))}
          </div>

          {inspectorTab === "details" ? (
            <>
          {selectedBlockItem ? (
            <div className="inspector-block">
              <div className="prompt-field-head">
                <h4>Working invitation</h4>
                <SharpenInvitationButton
                  disabled={!project.aiEnabled}
                  loading={isSharpeningInvitation}
                  onClick={() => handleSharpenInvitation()}
                />
              </div>
              <textarea
                onChange={(event) =>
                  handleBlockInvitationChange(
                    selection.sectionId,
                    selectedBlockItem.id,
                    event.target.value,
                  )
                }
                onBlur={(event) =>
                  commitBlockInvitationReview(
                    selection.sectionId,
                    selectedBlockItem.id,
                    event.currentTarget.value,
                  )
                }
                rows={4}
                value={selectedBlockItem.invitation}
              />
            </div>
          ) : null}

          {selectedLibraryEntry ? (
            <div className="inspector-block library-detail-callout">
              <div className="library-detail-hero">
                <LsIcon alt={selectedLibraryEntry.title} icon={selectedLibraryEntry.icon} />
                <div>
                  <span className="library-detail-kicker">Library detail</span>
                  <h4>{selectedLibraryEntry.title}</h4>
                  <p>{selectedLibraryEntry.libraryDescription ?? selectedLibraryEntry.shortDescription}</p>
                </div>
              </div>

              <LibraryMetaRow entry={selectedLibraryEntry} />

              <button
                className="primary-button library-detail-primary"
                onClick={() => setIsLibraryPositionPickerOpen((current) => !current)}
                type="button"
              >
                Add to flow
              </button>

              {isLibraryPositionPickerOpen ? (
                <div className="library-position-picker">
                  <div className="library-position-picker-head">
                    <span className="library-detail-kicker">Choose position</span>
                    <button
                      className="text-button"
                      onClick={() => setIsLibraryPositionPickerOpen(false)}
                      type="button"
                    >
                      Close
                    </button>
                  </div>
                  <div className="library-position-section-stack">
                    {project.sections.map((section) => {
                      const blocks = getSectionBlocks(section);
                      const positionCount = Math.max(blocks.length + 1, 1);

                      return (
                        <section key={section.id} className="library-position-section">
                          <div className="library-position-section-head">
                            <strong>
                              {section.indexLabel} · {section.title}
                            </strong>
                            <span>{section.totalLabel}</span>
                          </div>
                          <div className="library-position-options">
                            {Array.from({ length: positionCount }, (_value, index) => (
                              <button
                                className={`library-position-option ${
                                  section.id === activeSection.id &&
                                  index === getSectionBlocks(activeSection).length
                                    ? "is-recommended"
                                    : ""
                                }`}
                                key={`${section.id}-${index}`}
                                onClick={() =>
                                  handleAddSpecificBlockAtPosition(
                                    section,
                                    selectedLibraryEntry.id,
                                    index,
                                  )
                                }
                                type="button"
                              >
                                {getInsertPositionLabel(section, index)}
                              </button>
                            ))}
                          </div>
                        </section>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              <LibraryDecisionPanel entry={selectedLibraryEntry} review={selectedReview} />

              {selectedSteps?.length ? (
                <section className="library-detail-open-section">
                  <div className="library-detail-open-head">
                    <span className="library-detail-kicker">Flow phases</span>
                    <span>{selectedSteps.length} steps</span>
                  </div>
                  <LibraryStepPreview steps={selectedSteps} />
                </section>
              ) : null}
            </div>
          ) : null}

          {selectedTransitionItem ? (
            <div className="inspector-block">
              <h4>Transition bridge</h4>
              <div className="transition-editor-grid">
                <div className="field-group">
                  <label>Transition duration</label>
                  <input
                    onChange={(event) =>
                      updateTransition(selection.sectionId, selectedTransitionItem.id, {
                        durationLabel: event.target.value,
                      })
                    }
                    value={selectedTransitionItem.durationLabel}
                  />
                </div>
                <div className="field-group">
                  <label>Bridge note</label>
                  <textarea
                    onChange={(event) =>
                      updateTransition(selection.sectionId, selectedTransitionItem.id, {
                        note: event.target.value,
                      })
                    }
                    rows={4}
                    value={selectedTransitionItem.note}
                  />
                </div>
              </div>
            </div>
          ) : null}

          {selectedBlockItem?.flowSummary ? (
            <InspectorAccordion defaultOpen summary="Structure flow glance">
              <div className="flow-glance-box">{selectedBlockItem.flowSummary}</div>
            </InspectorAccordion>
          ) : null}

          <InspectorAccordion defaultOpen summary="Expected output">
            <div className="inspector-block">
              <p>{selectedEntry.output}</p>
            </div>
          </InspectorAccordion>

          {selectedSteps?.length ? (
            <InspectorAccordion
              summary="Structure flow"
              summaryMeta={`${selectedSteps.length} steps`}
            >
              <div className="inspector-block steps-panel">
                <div className="steps-panel-head">
                  <div>
                    <p className="steps-summary">
                      {selectedSteps.filter((step) => step.prompt).length} editable prompt moments
                    </p>
                  </div>
                </div>

                <div className="steps-list">
                  {selectedSteps.map((step, stepIndex) => (
                    <div key={step.title} className="step-card">
                      <div className="step-card-head">
                        <strong>{step.title}</strong>
                        <span className="step-card-note">{step.role}</span>
                      </div>
                      {step.prompt ? (
                        <div className="step-input-group">
                          <div className="prompt-field-head">
                            <label>Sub-prompt</label>
                            <SharpenInvitationButton
                              disabled={!project.aiEnabled || !selectedBlockItem}
                              loading={isSharpeningInvitation}
                              onClick={() =>
                                handleSharpenInvitation({
                                  promptLabel: `${step.title} sub-prompt`,
                                  promptText: step.prompt ?? "",
                                  stepIndex,
                                })
                              }
                            />
                          </div>
                          <textarea
                            onChange={(event) => {
                              if (!selectedBlockItem) {
                                return;
                              }

                              updateBlockStep(
                                selection.sectionId,
                                selectedBlockItem.id,
                                stepIndex,
                                {
                                  prompt: event.target.value,
                                },
                              );
                            }}
                            readOnly={!selectedBlockItem}
                            rows={3}
                            value={step.prompt}
                          />
                        </div>
                      ) : null}
                      <div className="step-input-group">
                        <label>Facilitator cue</label>
                        <textarea
                          onChange={(event) => {
                            if (!selectedBlockItem) {
                              return;
                            }

                            updateBlockStep(
                              selection.sectionId,
                              selectedBlockItem.id,
                              stepIndex,
                              {
                                facilitatorCue: event.target.value,
                              },
                            );
                          }}
                          readOnly={!selectedBlockItem}
                          rows={3}
                          value={step.facilitatorCue}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </InspectorAccordion>
          ) : null}
            </>
          ) : null}

          {inspectorTab === "checks" ? (
            <div className="inspector-tab-panel">
              <p className="inspector-fit-summary">
                Fit cues: {selectedReview.fitCues.join(" · ")}
              </p>

              <div className="review-card">
                <div className="review-head">
                  <StatusPill tone={selectedReview.tone}>
                    {selectedReview.label}
                  </StatusPill>
                  <span className="review-score">{selectedReview.score}</span>
                </div>
                <p>{selectedReview.summary}</p>
              </div>

              <div className="inspector-block">
                <h4>Why it belongs here</h4>
                <p>{selectedReview.why}</p>
              </div>

              <div className="inspector-block checks-list-block">
                <h4>Current warnings</h4>
                <ul className="review-list">
                  {previewWarnings.map((warning) => (
                    <li key={warning}>{warning}</li>
                  ))}
                </ul>
              </div>

              <div className="inspector-block checks-list-block">
                <h4>Section checks</h4>
                <div className="section-check-stack">
                  {project.sections.map((section) => {
                    const sectionReview = sectionReviewFallbacks[section.id];
                    const warningCount = getSectionWarningCount(section);

                    return (
                      <div key={section.id} className="section-check-card">
                        <div>
                          <strong>{section.indexLabel} · {section.title}</strong>
                          <p>{sectionReview.summary}</p>
                        </div>
                        <StatusPill tone={warningCount > 0 ? "warning" : sectionReview.tone}>
                          {warningCount > 0 ? `${warningCount} check` : sectionReview.label}
                        </StatusPill>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : null}

          {inspectorTab === "notes" ? (
            <div className="inspector-tab-panel">
              <div className="inspector-block">
                <h4>Section notes</h4>
                <textarea
                  onChange={(event) =>
                    updateSection(selectedSection.id, { notes: event.target.value })
                  }
                  placeholder="Capture prep notes, risks, materials, or facilitation reminders for this section."
                  rows={6}
                  value={selectedSection.notes ?? ""}
                />
              </div>

              {selectedBlockItem ? (
                <div className="inspector-block">
                  <h4>Block facilitator notes</h4>
                  <textarea
                    onChange={(event) =>
                      updateBlockNotes(
                        selectedSection.id,
                        selectedBlockItem.id,
                        event.target.value,
                      )
                    }
                    placeholder="Add private notes for facilitating this structure."
                    rows={7}
                    value={selectedBlockItem.facilitatorNotes ?? ""}
                  />
                </div>
              ) : null}

              {selectedTransitionItem ? (
                <div className="inspector-block">
                  <h4>Transition note</h4>
                  <p className="inspector-muted-note">
                    Transition notes are edited in Details because they are part of the
                    visible flow between blocks.
                  </p>
                </div>
              ) : null}

              {hasLibrarySelection ? (
                <div className="inspector-block">
                  <h4>Library guidance</h4>
                  <p>{selectedEntry.notes}</p>
                </div>
              ) : null}
            </div>
          ) : null}

          {inspectorTab === "recommendations" ? (
            <div className="inspector-tab-panel">
          {selectedPairRecommendations.length ? (
            <InspectorAccordion
              defaultOpen={hasLibrarySelection}
              summary="Pairs well with"
              summaryMeta={`${selectedPairRecommendations.length}`}
            >
              <div className="inspector-block">
                <div className="entry-link-stack">
                  {selectedPairRecommendations.map((recommendation) => (
                    <div key={recommendation.entry.id} className="entry-link-card">
                      <div className="entry-link-copy">
                        <strong>{recommendation.entry.title}</strong>
                        <p>{recommendation.reason}</p>
                        <span className="entry-link-meta">
                          {recommendation.meta} ·{" "}
                          {recommendation.entry.libraryMeta ?? recommendation.entry.typeLabel}
                        </span>
                      </div>
                      <div className="entry-link-actions">
                        <button
                          className="tiny-button"
                          onClick={() => inspectLibraryEntry(recommendation.entry.id)}
                          type="button"
                        >
                          Inspect
                        </button>
                        <button
                          className="tiny-button"
                          onClick={() =>
                            handleAddSpecificBlock(selectedSection, recommendation.entry.id)
                          }
                          type="button"
                        >
                          Use here
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </InspectorAccordion>
          ) : null}

          {selectedAlternativeRecommendations.length ? (
            <InspectorAccordion
              summary="Use instead"
              summaryMeta={`${selectedAlternativeRecommendations.length}`}
            >
              <div className="inspector-block">
                <div className="entry-link-stack">
                  {selectedAlternativeRecommendations.map((recommendation) => (
                    <div key={recommendation.entry.id} className="entry-link-card">
                      <div className="entry-link-copy">
                        <strong>{recommendation.entry.title}</strong>
                        <p>{recommendation.reason}</p>
                        <span className="entry-link-meta">
                          {recommendation.meta} ·{" "}
                          {recommendation.entry.libraryMeta ?? recommendation.entry.typeLabel}
                        </span>
                      </div>
                      <div className="entry-link-actions">
                        <button
                          className="tiny-button"
                          onClick={() => inspectLibraryEntry(recommendation.entry.id)}
                          type="button"
                        >
                          Inspect
                        </button>
                        <button
                          className="tiny-button"
                          onClick={() =>
                            handleAddSpecificBlock(selectedSection, recommendation.entry.id)
                          }
                          type="button"
                        >
                          Use here
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </InspectorAccordion>
          ) : null}

          <InspectorAccordion summary="Suggestions" summaryMeta={`${selectedReview.suggestions.length}`}>
            <div className="inspector-block">
              <div className="suggestion-stack">
                {selectedReview.suggestions.map((suggestion) => (
                  <button key={suggestion} className="suggestion-card" type="button">
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </InspectorAccordion>
            </div>
          ) : null}
        </aside>

        {invitationProposal ? (
          <div
            className="invitation-dialog-backdrop"
            onClick={handleDeclineInvitationProposal}
            role="presentation"
          >
            <div
              aria-labelledby="invitation-dialog-title"
              aria-modal="true"
              className="invitation-dialog"
              onClick={(event) => event.stopPropagation()}
              role="dialog"
            >
              <div className="invitation-dialog-head">
                <div>
                  <p className="eyebrow">
                    {invitationProposal.source === "ai"
                      ? invitationProposal.providerLabel
                      : "Local fallback suggestion"}
                  </p>
                  <h3 id="invitation-dialog-title">
                    {invitationProposal.needsChange
                      ? "Invitation refinement"
                      : "Invitation is already strong"}
                  </h3>
                </div>
                <button
                  aria-label="Close invitation refinement"
                  className="dialog-icon-button"
                  onClick={handleDeclineInvitationProposal}
                  type="button"
                >
                  x
                </button>
              </div>

              {invitationProposal.warning ? (
                <p className="invitation-dialog-warning">{invitationProposal.warning}</p>
              ) : null}

              <div className="invitation-dialog-grid">
                <div className="invitation-dialog-panel">
                  <span>Current {invitationProposal.promptLabel}</span>
                  <p>{invitationProposal.originalText}</p>
                </div>
                <div className="invitation-dialog-panel is-suggested">
                  <span>Suggested {invitationProposal.promptLabel}</span>
                  <p>{invitationProposal.text}</p>
                </div>
              </div>

              <div className="invitation-dialog-rationale">
                <span>Why this is better</span>
                <p>{invitationProposal.rationale}</p>
                {invitationProposal.learningPoints?.length ? (
                  <ul className="invitation-dialog-learning-list">
                    {invitationProposal.learningPoints.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                ) : null}
              </div>

              <div className="invitation-dialog-actions">
                <button
                  className="secondary-button"
                  onClick={handleDeclineInvitationProposal}
                  type="button"
                >
                  {invitationProposal.needsChange ? "Decline" : "Close"}
                </button>
                {invitationProposal.needsChange ? (
                  <button
                    className="primary-button"
                    onClick={handleAcceptInvitationProposal}
                    type="button"
                  >
                    Accept
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}

        {dragState && activePointerId !== null && isPointerDragging && pointerPosition ? (
          <div
            className="drag-preview"
            style={{
              transform: `translate(${pointerPosition.x + 18}px, ${pointerPosition.y + 18}px) rotate(-2deg)`,
            }}
          >
            {dragState.previewVariant === "transition" ? (
              <div className="drag-preview-card is-transition">
                <div className="transition-card-head">
                  <span className="transition-bridge-pill">
                    <svg
                      aria-hidden="true"
                      className="transition-bridge-icon"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M4.75 12h4.5m5.5 0h4.5M9.25 12a2.75 2.75 0 1 1 5.5 0a2.75 2.75 0 1 1-5.5 0Z"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.8"
                      />
                    </svg>
                    Bridge
                  </span>
                  <span className="transition-time">
                    {draggedTransitionItem?.durationLabel ?? draggedBlockItem?.durationLabel}
                  </span>
                </div>
                <p className="transition-note">
                  {draggedTransitionItem?.note ?? "Carry this moment into the next move."}
                </p>
              </div>
            ) : (
              <div className="drag-preview-card">
                <div className="drag-preview-top">
                  {dragPreviewEntry ? (
                    <LsIcon alt={dragPreviewEntry.title} icon={dragPreviewEntry.icon} />
                  ) : null}
                  <div>
                    <strong>{dragPreviewEntry?.title}</strong>
                    <div className="block-meta">
                      {draggedBlockItem?.durationLabel ?? "Move"} · {dragPreviewEntry?.typeLabel}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
}
