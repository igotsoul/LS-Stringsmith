import { getInspectableEntry } from "@/domain/workshop/demo-project";
import type {
  BlockItem,
  SectionItem,
  StepFlow,
  TransitionItem,
  WorkshopProject,
  WorkshopSection,
} from "@/domain/workshop/types";

function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

function relabelSections(sections: WorkshopSection[]) {
  return sections.map((section, index) => ({
    ...section,
    indexLabel: String(index + 1).padStart(2, "0"),
  }));
}

function parseMinutes(durationLabel: string) {
  const match = durationLabel.match(/(\d+)/);
  return match ? Number(match[1]) : 0;
}

function deriveDurationLabel(section: WorkshopSection) {
  const totalMinutes = section.items.reduce((sum, item) => {
    return sum + parseMinutes(item.durationLabel);
  }, 0);

  return totalMinutes > 0 ? `${totalMinutes} min chain` : "Draft";
}

function deriveCollapsedSummary(section: WorkshopSection) {
  const titles = section.items
    .filter((item): item is BlockItem => item.kind === "block")
    .map((item) => getInspectableEntry(item.entryId).title);

  return titles.length > 0 ? titles.join(" -> ") : "Draft section";
}

function deriveMiniPreviewEntryIds(section: WorkshopSection) {
  const ids = section.items
    .filter((item): item is BlockItem => item.kind === "block")
    .map((item) => item.entryId);

  return Array.from(new Set(ids)).slice(0, 4);
}

function enrichSection(section: WorkshopSection) {
  const hasItems = section.items.length > 0;
  const miniPreviewEntryIds = deriveMiniPreviewEntryIds(section);

  return {
    ...section,
    totalLabel: hasItems ? deriveDurationLabel(section) : "Draft",
    status: hasItems ? "ready" : "draft",
    collapsedSummary: hasItems ? deriveCollapsedSummary(section) : "Draft section",
    miniPreviewEntryIds: miniPreviewEntryIds.length > 0 ? miniPreviewEntryIds : undefined,
    suggestedEntryIds:
      section.suggestedEntryIds.length > 0
        ? section.suggestedEntryIds
        : miniPreviewEntryIds.slice(0, 2),
  } satisfies WorkshopSection;
}

function durationFromEntry(entryId: string) {
  const entry = getInspectableEntry(entryId);
  const match = entry.libraryMeta?.match(/(\d+)\s*min/i);

  if (match) {
    return `${match[1]} min`;
  }

  return entry.kind === "neutral" ? "8 min" : "12 min";
}

function cloneSteps(steps?: StepFlow[]) {
  return steps?.map((step) => ({
    ...step,
  }));
}

function invitationFromEntry(entryId: string) {
  const entry = getInspectableEntry(entryId);
  const firstPrompt = entry.steps?.find((step) => step.prompt)?.prompt;

  return firstPrompt ?? `Draft invitation for ${entry.title}.`;
}

function flowSummaryFromEntry(entryId: string) {
  const entry = getInspectableEntry(entryId);

  if (!entry.steps?.length) {
    return undefined;
  }

  return entry.steps
    .map((step) => step.title.replace(/^\d+\.\s*/, ""))
    .join(" -> ");
}

function flowSummaryFromSteps(steps?: StepFlow[]) {
  if (!steps?.length) {
    return undefined;
  }

  return steps
    .map((step) => step.title.replace(/^\d+\.\s*/, ""))
    .join(" -> ");
}

function facilitatorCueFromEntry(entryId: string) {
  const entry = getInspectableEntry(entryId);
  return entry.steps?.[0]?.facilitatorCue;
}

function warningFromEntry(entryId: string) {
  const entry = getInspectableEntry(entryId);

  if (entry.reviewSummary.tone !== "warning") {
    return undefined;
  }

  return entry.suggestions[0] ?? "Worth one more review pass.";
}

function createBlockItem(sectionId: string, entryId: string) {
  const entry = getInspectableEntry(entryId);
  const steps = cloneSteps(entry.steps);

  return {
    id: createId(`${sectionId}-block`),
    kind: "block",
    entryId,
    durationLabel: durationFromEntry(entryId),
    invitation: invitationFromEntry(entryId),
    facilitatorNotes: "",
    steps,
    flowSummary: flowSummaryFromSteps(steps) ?? flowSummaryFromEntry(entryId),
    facilitatorCue: facilitatorCueFromEntry(entryId),
    warning: warningFromEntry(entryId),
  } satisfies BlockItem;
}

function createTransitionItem(
  sectionId: string,
  previousEntryId: string,
  nextEntryId: string,
) {
  const previousTitle = getInspectableEntry(previousEntryId).title;
  const nextTitle = getInspectableEntry(nextEntryId).title;

  return {
    id: createId(`${sectionId}-transition`),
    kind: "transition",
    entryId: "transition-generic",
    durationLabel: "2 min",
    note: `Bridge from ${previousTitle} into ${nextTitle}.`,
  } satisfies TransitionItem;
}

function createSectionTemplate(previousSection?: WorkshopSection) {
  const id = createId("section");

  return {
    id,
    indexLabel: "00",
    title: "New section",
    subgoal: "Define the next workshop move and the outcome you want to create.",
    dayLabel: previousSection?.dayLabel ?? "Day 1",
    timeRange: undefined,
    notes: "",
    totalLabel: "Draft",
    prepNote: "Shape the section with one clear move and one visible outcome.",
    prepLevel: "Light",
    storyMeta: "Fresh draft · choose the first block.",
    reviewSummary: undefined,
    collapsedSummary: "Draft section",
    miniPreviewEntryIds: undefined,
    suggestedEntryIds: ["input", "reflection"],
    status: "draft",
    items: [],
  } satisfies WorkshopSection;
}

function cloneSectionItems(sectionId: string, items: SectionItem[]) {
  return items.map((item) =>
    item.kind === "block"
      ? ({
          ...item,
          id: createId(`${sectionId}-block`),
          steps: cloneSteps(item.steps),
        } satisfies BlockItem)
      : ({
          ...item,
          id: createId(`${sectionId}-transition`),
        } satisfies TransitionItem),
  );
}

function getSectionBlocks(section: WorkshopSection) {
  return section.items.filter((item): item is BlockItem => item.kind === "block");
}

function createTransitionLookup(section: WorkshopSection) {
  const blocks = getSectionBlocks(section);
  const transitions = section.items.filter(
    (item): item is TransitionItem => item.kind === "transition",
  );
  const lookup = new Map<
    string,
    {
      durationLabel: string;
      note: string;
    }
  >();

  transitions.forEach((transition, index) => {
    const previous = blocks[index];
    const next = blocks[index + 1];

    if (!previous || !next) {
      return;
    }

    lookup.set(`${previous.entryId}=>${next.entryId}`, {
      durationLabel: transition.durationLabel,
      note: transition.note,
    });
  });

  return lookup;
}

function createRebuiltTransitionItem(
  sectionId: string,
  previousEntryId: string,
  nextEntryId: string,
  existing?: {
    durationLabel: string;
    note: string;
  },
) {
  const transition = createTransitionItem(sectionId, previousEntryId, nextEntryId);

  if (!existing) {
    return transition;
  }

  return {
    ...transition,
    durationLabel: existing.durationLabel,
    note: existing.note,
  } satisfies TransitionItem;
}

function clampIndex(index: number, max: number) {
  return Math.min(Math.max(index, 0), max);
}

function rebuildSection(section: WorkshopSection, blocks: BlockItem[]) {
  const transitionLookup = createTransitionLookup(section);
  const items: SectionItem[] = [];

  blocks.forEach((block, index) => {
    items.push(block);

    if (index >= blocks.length - 1) {
      return;
    }

    const nextBlock = blocks[index + 1];
    const lookupKey = `${block.entryId}=>${nextBlock.entryId}`;

    items.push(
      createRebuiltTransitionItem(
        section.id,
        block.entryId,
        nextBlock.entryId,
        transitionLookup.get(lookupKey),
      ),
    );
  });

  return enrichSection({
    ...section,
    items,
    storyMeta:
      blocks.length === 0
        ? "Fresh draft · choose the first block."
        : section.status === "draft"
          ? "Live draft · refine transitions and invitation wording."
          : section.storyMeta,
  });
}

export function addSection(
  project: WorkshopProject,
  options?: {
    afterSectionId?: string | null;
    values?: Partial<Pick<WorkshopSection, "title" | "subgoal" | "timeRange" | "dayLabel" | "notes">>;
  },
) {
  const targetIndex = options?.afterSectionId
    ? project.sections.findIndex((section) => section.id === options.afterSectionId)
    : project.sections.length - 1;
  const insertIndex = targetIndex >= 0 ? targetIndex + 1 : project.sections.length;
  const previousSection = project.sections[Math.max(0, insertIndex - 1)] ?? project.sections.at(-1);
  const nextSection = enrichSection({
    ...createSectionTemplate(previousSection),
    ...options?.values,
  });
  const nextSections = [...project.sections];
  nextSections.splice(insertIndex, 0, nextSection);

  return {
    ...project,
    sections: relabelSections(nextSections),
  } satisfies WorkshopProject;
}

export function duplicateSection(project: WorkshopProject, sectionId: string) {
  const sourceIndex = project.sections.findIndex((section) => section.id === sectionId);

  if (sourceIndex === -1) {
    return project;
  }

  const source = project.sections[sourceIndex];
  const nextId = createId("section");
  const duplicated = enrichSection({
    ...source,
    id: nextId,
    indexLabel: "00",
    title: `${source.title} copy`,
    storyMeta: "Copied section · refine as needed.",
    items: cloneSectionItems(nextId, source.items),
  });

  const nextSections = [...project.sections];
  nextSections.splice(sourceIndex + 1, 0, duplicated);

  return {
    ...project,
    sections: relabelSections(nextSections),
  } satisfies WorkshopProject;
}

export function moveSection(
  project: WorkshopProject,
  sectionId: string,
  direction: "up" | "down",
) {
  const sourceIndex = project.sections.findIndex((section) => section.id === sectionId);

  if (sourceIndex === -1) {
    return project;
  }

  const targetIndex = direction === "up" ? sourceIndex - 1 : sourceIndex + 1;

  if (targetIndex < 0 || targetIndex >= project.sections.length) {
    return project;
  }

  const nextSections = [...project.sections];
  const [section] = nextSections.splice(sourceIndex, 1);
  nextSections.splice(targetIndex, 0, section);

  return {
    ...project,
    sections: relabelSections(nextSections),
  } satisfies WorkshopProject;
}

export function removeSection(project: WorkshopProject, sectionId: string) {
  if (project.sections.length <= 1) {
    return project;
  }

  const nextSections = project.sections.filter((section) => section.id !== sectionId);

  if (nextSections.length === project.sections.length) {
    return project;
  }

  return {
    ...project,
    sections: relabelSections(nextSections),
  } satisfies WorkshopProject;
}

export function removeSections(project: WorkshopProject, sectionIds: string[]) {
  if (project.sections.length <= 1 || sectionIds.length === 0) {
    return project;
  }

  const idsToRemove = new Set(sectionIds);
  const nextSections = project.sections.filter((section) => !idsToRemove.has(section.id));

  if (nextSections.length === 0 || nextSections.length === project.sections.length) {
    return project;
  }

  return {
    ...project,
    sections: relabelSections(nextSections),
  } satisfies WorkshopProject;
}

export function updateSectionMeta(
  project: WorkshopProject,
  sectionId: string,
  values: Partial<Pick<WorkshopSection, "title" | "subgoal" | "timeRange" | "dayLabel" | "notes">>,
) {
  return {
    ...project,
    sections: project.sections.map((section) =>
      section.id === sectionId
        ? enrichSection({
            ...section,
            ...values,
          })
        : section,
    ),
  } satisfies WorkshopProject;
}

export function renameDayLabel(
  project: WorkshopProject,
  currentDayLabel: string,
  nextDayLabel: string,
) {
  const normalizedNextLabel = nextDayLabel.trim();

  if (!normalizedNextLabel || normalizedNextLabel === currentDayLabel) {
    return project;
  }

  return {
    ...project,
    sections: project.sections.map((section) =>
      section.dayLabel === currentDayLabel
        ? {
            ...section,
            dayLabel: normalizedNextLabel,
          }
        : section,
    ),
  } satisfies WorkshopProject;
}

export function moveSectionToDay(
  project: WorkshopProject,
  sectionId: string,
  nextDayLabel: string,
) {
  const normalizedNextLabel = nextDayLabel.trim();
  const sourceIndex = project.sections.findIndex((section) => section.id === sectionId);

  if (!normalizedNextLabel || sourceIndex === -1) {
    return project;
  }

  const sourceSection = project.sections[sourceIndex];

  if (sourceSection.dayLabel === normalizedNextLabel) {
    return project;
  }

  const movedSection = enrichSection({
    ...sourceSection,
    dayLabel: normalizedNextLabel,
  });
  const nextSections = project.sections.filter((section) => section.id !== sectionId);
  const targetDayLastIndex = nextSections.reduce(
    (lastIndex, section, index) =>
      section.dayLabel === normalizedNextLabel ? index : lastIndex,
    -1,
  );
  const insertIndex = targetDayLastIndex === -1 ? nextSections.length : targetDayLastIndex + 1;

  nextSections.splice(insertIndex, 0, movedSection);

  return {
    ...project,
    sections: relabelSections(nextSections),
  } satisfies WorkshopProject;
}

export function updateBlockNotes(
  project: WorkshopProject,
  sectionId: string,
  blockItemId: string,
  facilitatorNotes: string,
) {
  return {
    ...project,
    sections: project.sections.map((section) => {
      if (section.id !== sectionId) {
        return section;
      }

      return enrichSection({
        ...section,
        items: section.items.map((item) =>
          item.kind === "block" && item.id === blockItemId
            ? {
                ...item,
                facilitatorNotes,
              }
            : item,
        ),
      });
    }),
  } satisfies WorkshopProject;
}

export function updateTransitionMeta(
  project: WorkshopProject,
  sectionId: string,
  transitionId: string,
  values: Partial<Pick<TransitionItem, "durationLabel" | "note">>,
) {
  return {
    ...project,
    sections: project.sections.map((section) => {
      if (section.id !== sectionId) {
        return section;
      }

      return enrichSection({
        ...section,
        items: section.items.map((item) =>
          item.kind === "transition" && item.id === transitionId
            ? {
                ...item,
                ...values,
              }
            : item,
        ),
      });
    }),
  } satisfies WorkshopProject;
}

export function updateBlockStep(
  project: WorkshopProject,
  sectionId: string,
  blockItemId: string,
  stepIndex: number,
  values: Partial<Pick<StepFlow, "prompt" | "facilitatorCue">>,
) {
  return {
    ...project,
    sections: project.sections.map((section) => {
      if (section.id !== sectionId) {
        return section;
      }

      return enrichSection({
        ...section,
        items: section.items.map((item) => {
          if (item.kind !== "block" || item.id !== blockItemId) {
            return item;
          }

          const baseSteps = item.steps ?? cloneSteps(getInspectableEntry(item.entryId).steps) ?? [];
          const nextSteps = baseSteps.map((step, index) =>
            index === stepIndex
              ? {
                  ...step,
                  ...values,
                }
              : step,
          );

          return {
            ...item,
            steps: nextSteps,
            flowSummary: flowSummaryFromSteps(nextSteps) ?? item.flowSummary,
            facilitatorCue:
              nextSteps.find((step) => step.facilitatorCue)?.facilitatorCue ??
              item.facilitatorCue,
          } satisfies BlockItem;
        }),
      });
    }),
  } satisfies WorkshopProject;
}

export function addBlockToSection(
  project: WorkshopProject,
  sectionId: string,
  entryId: string,
  targetIndex?: number,
) {
  const entry = getInspectableEntry(entryId);

  if (entry.kind === "transition") {
    return {
      project,
      newItemId: null,
    };
  }

  let newItemId: string | null = null;

  const nextProject = {
    ...project,
    sections: project.sections.map((section) => {
      if (section.id !== sectionId) {
        return section;
      }

      const nextBlocks = [...getSectionBlocks(section)];
      const nextBlock = createBlockItem(sectionId, entryId);
      newItemId = nextBlock.id;
      const insertionIndex = clampIndex(targetIndex ?? nextBlocks.length, nextBlocks.length);

      nextBlocks.splice(insertionIndex, 0, nextBlock);

      return rebuildSection(section, nextBlocks);
    }),
  } satisfies WorkshopProject;

  return {
    project: nextProject,
    newItemId,
  };
}

export function moveBlockInProject(
  project: WorkshopProject,
  fromSectionId: string,
  blockItemId: string,
  toSectionId: string,
  targetIndex: number,
) {
  const sourceSection = project.sections.find((section) => section.id === fromSectionId);
  const targetSection = project.sections.find((section) => section.id === toSectionId);

  if (!sourceSection || !targetSection) {
    return {
      project,
      movedItemId: null,
    };
  }

  const sourceBlocks = [...getSectionBlocks(sourceSection)];
  const sourceIndex = sourceBlocks.findIndex((block) => block.id === blockItemId);

  if (sourceIndex === -1) {
    return {
      project,
      movedItemId: null,
    };
  }

  const [movingBlock] = sourceBlocks.splice(sourceIndex, 1);

  if (!movingBlock) {
    return {
      project,
      movedItemId: null,
    };
  }

  const nextProject = {
    ...project,
    sections: project.sections.map((section) => {
      if (section.id === fromSectionId && section.id === toSectionId) {
        const sameSectionBlocks = [...getSectionBlocks(section)];
        const currentIndex = sameSectionBlocks.findIndex((block) => block.id === blockItemId);

        if (currentIndex === -1) {
          return section;
        }

        const [sameSectionBlock] = sameSectionBlocks.splice(currentIndex, 1);
        const normalizedTargetIndex =
          targetIndex > currentIndex ? targetIndex - 1 : targetIndex;

        sameSectionBlocks.splice(
          clampIndex(normalizedTargetIndex, sameSectionBlocks.length),
          0,
          sameSectionBlock!,
        );

        return rebuildSection(section, sameSectionBlocks);
      }

      if (section.id === fromSectionId) {
        return rebuildSection(section, sourceBlocks);
      }

      if (section.id === toSectionId) {
        const targetBlocks = [...getSectionBlocks(section)];
        targetBlocks.splice(clampIndex(targetIndex, targetBlocks.length), 0, movingBlock);

        return rebuildSection(section, targetBlocks);
      }

      return section;
    }),
  } satisfies WorkshopProject;

  return {
    project: nextProject,
    movedItemId: movingBlock.id,
  };
}

export function removeBlockFromSection(
  project: WorkshopProject,
  sectionId: string,
  blockItemId: string,
) {
  return {
    ...project,
    sections: project.sections.map((section) => {
      if (section.id !== sectionId) {
        return section;
      }

      const nextBlocks = getSectionBlocks(section).filter((block) => block.id !== blockItemId);
      return rebuildSection(section, nextBlocks);
    }),
  } satisfies WorkshopProject;
}
