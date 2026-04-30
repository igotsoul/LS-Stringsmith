import { getInspectableEntry } from "@/domain/workshop/demo-project";
import { getStorageModeDetails, type ProjectStorageMode } from "@/storage/projects/storage-mode";
import type { StoredProjectRecord } from "@/storage/projects/adapters";
import type {
  BlockItem,
  ProjectCardSummary,
  PreviewFocus,
  SetupHotspot,
  TransitionItem,
  WorkshopProject,
  WorkshopSection,
} from "@/domain/workshop/types";

type PrepSignal = {
  driver: string;
  focus: string;
  weight: number;
};

function countDayGroups(sections: WorkshopSection[]) {
  return new Set(sections.map((section) => section.dayLabel)).size;
}

function countDraftSections(project: WorkshopProject) {
  return project.sections.filter((section) => section.status === "draft").length;
}

function getSectionBlocks(section: WorkshopSection) {
  return section.items.filter((item): item is BlockItem => item.kind === "block");
}

function getSectionTransitions(section: WorkshopSection) {
  return section.items.filter((item): item is TransitionItem => item.kind === "transition");
}

function parseNumber(value?: string) {
  const match = value?.match(/\d+(?:[.,]\d+)?/);
  const parsed = match ? Number(match[0].replace(",", ".")) : 0;

  return Number.isFinite(parsed) ? parsed : 0;
}

function parseDurationMinutes(durationLabel?: string) {
  const value = parseNumber(durationLabel);
  const label = durationLabel?.toLowerCase() ?? "";

  if (!value) {
    return 0;
  }

  if (/\b(day|days|tag|tage|d)\b/.test(label)) {
    return value * 8 * 60;
  }

  if (/\b(h|hr|hrs|hour|hours|stunde|stunden)\b/.test(label)) {
    return value * 60;
  }

  return value;
}

function parseParticipantCount(participantsLabel: string) {
  return Math.max(1, Math.round(parseNumber(participantsLabel) || 1));
}

function hasGenericSectionFrame(section: WorkshopSection) {
  const title = section.title.trim().toLowerCase();
  const subgoal = section.subgoal.trim().toLowerCase();

  return (
    title.length < 4 ||
    title === "new section" ||
    subgoal.length < 24 ||
    subgoal.includes("define the next workshop move")
  );
}

function addPrepSignal(signals: PrepSignal[], weight: number, driver: string, focus: string) {
  signals.push({ driver, focus, weight });
}

function prepLevelFromScore(score: number): SetupHotspot["prepLevel"] {
  if (score >= 6) {
    return "Deep";
  }

  if (score >= 3) {
    return "Medium";
  }

  return "Light";
}

function formatList(values: string[]) {
  const uniqueValues = Array.from(new Set(values));

  if (uniqueValues.length <= 1) {
    return uniqueValues[0] ?? "";
  }

  if (uniqueValues.length === 2) {
    return `${uniqueValues[0]} and ${uniqueValues[1]}`;
  }

  return `${uniqueValues.slice(0, -1).join(", ")}, and ${uniqueValues.at(-1)}`;
}

function formatFocusList(values: string[]) {
  const uniqueValues = Array.from(new Set(values));

  if (uniqueValues.length <= 1) {
    return uniqueValues[0] ?? "";
  }

  if (uniqueValues.length === 2) {
    return `${uniqueValues[0]} plus ${uniqueValues[1]}`;
  }

  return `${uniqueValues.slice(0, -1).join(", ")}, plus ${uniqueValues.at(-1)}`;
}

function pluralize(count: number, singular: string, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

function toBe(count: number) {
  return count === 1 ? "is" : "are";
}

function describePrepSignals(signals: PrepSignal[], prepLevel: SetupHotspot["prepLevel"]) {
  if (signals.length === 0) {
    return "Current shape is compact and low-risk; confirm timing and move on.";
  }

  const sortedSignals = [...signals].sort((first, second) => second.weight - first.weight);
  const topSignals = sortedSignals.slice(0, 3);
  const driverText = formatList(topSignals.map((signal) => signal.driver));
  const focusText = formatFocusList(topSignals.map((signal) => signal.focus));

  if (sortedSignals.some((signal) => signal.focus === "the first concrete chain and outcome")) {
    return `Start by making this section concrete: define ${focusText}.`;
  }

  if (prepLevel === "Deep") {
    return `Needs a clear run-of-show: ${driverText}. Focus on ${focusText}.`;
  }

  if (prepLevel === "Medium") {
    return `Prep focus: clarify ${focusText}. Main driver${topSignals.length === 1 ? "" : "s"}: ${driverText}.`;
  }

  return `Low prep load: confirm ${focusText} and keep the section lightweight.`;
}

function evaluateSectionPrep(project: WorkshopProject, section: WorkshopSection) {
  const blocks = getSectionBlocks(section);
  const transitions = getSectionTransitions(section);
  const participantCount = parseParticipantCount(project.participantsLabel);
  const totalMinutes =
    parseDurationMinutes(section.totalLabel) ||
    section.items.reduce((sum, item) => sum + parseDurationMinutes(item.durationLabel), 0);
  const warningCount = blocks.filter((block) => block.warning).length;
  const detailedCount = blocks.filter((block) => block.showDetailedSteps).length;
  const signals: PrepSignal[] = [];

  if (section.status === "draft" || blocks.length === 0) {
    addPrepSignal(
      signals,
      2,
      "a draft section",
      "the first concrete chain and outcome",
    );
  }

  if (hasGenericSectionFrame(section)) {
    addPrepSignal(signals, 1, "generic section framing", "the section purpose");
  }

  if (blocks.length >= 3) {
    addPrepSignal(signals, 2, `${blocks.length} moves`, "timing and handoffs");
  } else if (blocks.length === 2) {
    addPrepSignal(signals, 1, "2 moves", "the handoff between moves");
  }

  if (transitions.length >= 2) {
    addPrepSignal(signals, 1, "several handoffs", "participant carry-forward between moves");
  }

  if (detailedCount >= 2) {
    addPrepSignal(signals, 2, `${detailedCount} detailed moves`, "step-by-step instructions");
  } else if (detailedCount === 1) {
    addPrepSignal(signals, 1, "1 detailed move", "step-by-step instructions");
  }

  if (warningCount > 0) {
    addPrepSignal(
      signals,
      Math.min(2, warningCount),
      `${warningCount} facilitation check${warningCount === 1 ? "" : "s"}`,
      "the open checks",
    );
  }

  if (totalMinutes >= 90) {
    addPrepSignal(signals, 2, "long duration", "timing checkpoints");
  } else if (totalMinutes >= 45) {
    addPrepSignal(signals, 1, "moderate duration", "time discipline");
  }

  if (project.conflictLevel === "High") {
    addPrepSignal(signals, 2, "high conflict", "safety and framing");
  } else if (project.conflictLevel === "Moderate") {
    addPrepSignal(signals, 1, "moderate conflict", "careful framing");
  }

  if (project.trustLevel === "Low") {
    addPrepSignal(signals, 2, "low trust", "safety and clarity");
  } else if (project.trustLevel === "Growing" || project.trustLevel === "Unknown") {
    addPrepSignal(signals, 1, `${project.trustLevel.toLowerCase()} trust`, "visible scaffolding");
  }

  if (project.format === "Online" || project.format === "Hybrid") {
    addPrepSignal(signals, 1, `${project.format.toLowerCase()} format`, "room and tool logistics");
  }

  if (project.decisionNeed === "Make decisions") {
    addPrepSignal(signals, 2, "decision pressure", "explicit convergence");
  } else if (project.decisionNeed === "Practical agreements") {
    addPrepSignal(signals, 1, "practical agreements", "a clear harvest");
  }

  if (participantCount >= 30) {
    addPrepSignal(signals, 2, `${participantCount} participants`, "instructions and grouping");
  } else if (participantCount >= 16) {
    addPrepSignal(signals, 1, `${participantCount} participants`, "group management");
  }

  const score = signals.reduce((sum, signal) => sum + signal.weight, 0);
  const prepLevel = prepLevelFromScore(score);

  return {
    detail: describePrepSignals(signals, prepLevel),
    prepLevel,
    score,
  };
}

function buildRelativeSaveLabel(lastSavedAt: string | null) {
  if (!lastSavedAt) {
    return "Saved locally";
  }

  const savedAt = new Date(lastSavedAt).getTime();
  const deltaMinutes = Math.max(0, Math.round((Date.now() - savedAt) / 60000));

  if (deltaMinutes < 1) {
    return "Updated just now";
  }

  if (deltaMinutes === 1) {
    return "Updated 1 min ago";
  }

  if (deltaMinutes < 60) {
    return `Updated ${deltaMinutes} min ago`;
  }

  const deltaHours = Math.round(deltaMinutes / 60);

  if (deltaHours === 1) {
    return "Updated 1 hour ago";
  }

  if (deltaHours < 24) {
    return `Updated ${deltaHours} hours ago`;
  }

  const deltaDays = Math.round(deltaHours / 24);

  if (deltaDays === 1) {
    return "Updated yesterday";
  }

  return `Updated ${deltaDays} days ago`;
}

export function buildLiveProjectCard(
  project: WorkshopProject,
  lastSavedAt: string | null,
  storageMode: ProjectStorageMode,
  featured = false,
): ProjectCardSummary {
  const draftCount = countDraftSections(project);
  const storage = getStorageModeDetails(storageMode);

  return {
    id: project.id,
    title: project.title,
    purposePreview: project.globalPurpose,
    sectionCountLabel: `${project.sections.length} sections`,
    languageLabel: project.language.slice(0, 2).toUpperCase(),
    formatLabel: project.format,
    aiLabel: project.aiEnabled ? "AI enabled" : "No AI",
    storageLabel: storage.cardLabel,
    updatedLabel: buildRelativeSaveLabel(lastSavedAt),
    footerLabel:
      draftCount > 0 ? `${draftCount} draft section${draftCount > 1 ? "s" : ""}` : "Preview ready",
    badgeLabel: featured ? "Active project" : draftCount > 0 ? "Live draft" : "Ready to refine",
    badgeTone: draftCount > 0 ? "warning" : "success",
    featured,
  };
}

export function buildProjectCards(
  records: StoredProjectRecord[],
  activeProjectId: string,
  storageMode: ProjectStorageMode,
) {
  const sortedRecords = [...records].sort((first, second) => {
    if (first.id === activeProjectId) {
      return -1;
    }

    if (second.id === activeProjectId) {
      return 1;
    }

    return new Date(second.savedAt).getTime() - new Date(first.savedAt).getTime();
  });

  return sortedRecords.map((record) =>
    buildLiveProjectCard(
      record.project,
      record.savedAt,
      storageMode,
      record.id === activeProjectId,
    ),
  );
}

export function buildCanvasSummary(project: WorkshopProject) {
  const draftCount = countDraftSections(project);

  return `${project.sections.length} sections · ${countDayGroups(project.sections)} day groups · ${
    draftCount > 0 ? `${draftCount} draft` : "preview ready"
  }`;
}

export function buildProjectPulse(project: WorkshopProject) {
  const detailedCount = project.sections.reduce((count, section) => {
    return count + section.items.filter((item) => item.kind === "block" && item.showDetailedSteps).length;
  }, 0);
  const prepHotspots = buildSetupHotspots(project);
  const deepCount = prepHotspots.filter((hotspot) => hotspot.prepLevel === "Deep").length;
  const draftCount = countDraftSections(project);

  return [
    `${detailedCount} structure${detailedCount === 1 ? "" : "s"} already ${
      detailedCount === 1 ? "has" : "have"
    } step-level facilitation detail.`,
    `${deepCount} section${deepCount === 1 ? "" : "s"} ${
      deepCount === 1 ? "needs" : "need"
    } deeper choreography based on the current frame.`,
    draftCount > 0
      ? `${draftCount} section${draftCount === 1 ? "" : "s"} still need a final shape before export.`
      : "All sections currently have a defined workshop shape.",
    `${project.format} · ${project.participantsLabel} · ${project.language}.`,
  ];
}

export function buildSetupHotspots(project: WorkshopProject): SetupHotspot[] {
  return project.sections.map((section) => {
    const evaluation = evaluateSectionPrep(project, section);

    return {
      sectionId: section.id,
      title: `Section ${section.indexLabel}`,
      detail: evaluation.detail,
      prepLevel: evaluation.prepLevel,
    };
  });
}

export function buildPreviewWarnings(project: WorkshopProject) {
  const warnings = new Set<string>();

  for (const section of project.sections) {
    if (section.status === "draft") {
      warnings.add(`${section.title} is still a draft section.`);
    }

    for (const item of section.items) {
      if (item.kind === "block" && item.warning) {
        warnings.add(`${getInspectableEntry(item.entryId).title}: ${item.warning}.`);
      }
    }
  }

  return warnings.size > 0 ? Array.from(warnings) : ["No blocking issues detected yet."];
}

export function buildPreviewFocus(project: WorkshopProject): PreviewFocus[] {
  const focusItems: PreviewFocus[] = [];
  const setupHotspots = new Map(
    buildSetupHotspots(project).map((hotspot) => [hotspot.sectionId, hotspot]),
  );

  for (const section of project.sections) {
    const hotspot = setupHotspots.get(section.id);

    if (hotspot?.prepLevel === "Deep") {
      focusItems.push({
        title: section.title,
        detail: hotspot.detail,
      });
    }

    for (const item of section.items) {
      if (item.kind === "block" && item.showDetailedSteps) {
        focusItems.push({
          title: getInspectableEntry(item.entryId).title,
          detail: item.facilitatorCue ?? "Keep the facilitation moves crisp and well scaffolded.",
        });
      }
    }
  }

  return focusItems.slice(0, 3);
}
