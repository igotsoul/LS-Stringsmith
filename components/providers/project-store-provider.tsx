"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";

import { createDemoProject, demoProjectId } from "@/domain/workshop/demo-project";
import {
  addBlockToSection as addBlockToSectionMutation,
  addSection as addSectionMutation,
  duplicateSection as duplicateSectionMutation,
  moveSection as moveSectionMutation,
  moveBlockInProject as moveBlockInProjectMutation,
  removeSection as removeSectionMutation,
  removeSections as removeSectionsMutation,
  removeBlockFromSection as removeBlockFromSectionMutation,
  moveSectionToDay as moveSectionToDayMutation,
  renameDayLabel as renameDayLabelMutation,
  updateBlockNotes as updateBlockNotesMutation,
  updateBlockStep as updateBlockStepMutation,
  updateSectionMeta,
  updateTransitionMeta as updateTransitionMetaMutation,
} from "@/domain/workshop/project-mutations";
import {
  createBlankProject,
  duplicateWorkshopProject,
  retargetImportedProject,
} from "@/domain/workshop/project-management";
import type {
  BlockItem,
  SectionItem,
  StepFlow,
  TransitionItem,
  WorkshopProject,
  WorkshopSection,
} from "@/domain/workshop/types";
import { getProjectStorageAdapter, type StoredProjectRecord } from "@/storage/projects/adapters";
import {
  loadRuntimeActiveProjectId,
  loadRuntimeStorageMode,
  saveRuntimeActiveProjectId,
  saveRuntimeStorageMode,
} from "@/storage/projects/indexeddb";
import {
  defaultProjectStorageMode,
  type ProjectStorageMode,
} from "@/storage/projects/storage-mode";

type ProjectStatus = "hydrating" | "ready";
type SaveState = "idle" | "saving" | "saved" | "error";

type ProjectMetaFields = Pick<
  WorkshopProject,
  | "title"
  | "globalPurpose"
  | "context"
  | "targetAudience"
  | "durationLabel"
  | "participantsLabel"
  | "format"
  | "language"
  | "desiredFeel"
  | "energyLevel"
  | "trustLevel"
  | "conflictLevel"
  | "decisionNeed"
>;

type SectionMetaFields = Pick<WorkshopSection, "title" | "subgoal" | "timeRange" | "dayLabel" | "notes">;

interface ImportProjectOptions {
  targetProjectId?: string | null;
}

interface ProjectStoreContextValue {
  activeProjectId: string;
  project: WorkshopProject;
  projectRecords: StoredProjectRecord[];
  storageMode: ProjectStorageMode;
  ownerEmail: string | null;
  status: ProjectStatus;
  saveState: SaveState;
  lastSavedAt: string | null;
  createProject(): string;
  renameProject(projectId: string, title: string): boolean;
  duplicateProject(projectId: string): string | null;
  deleteProject(projectId: string): Promise<string | null>;
  selectProject(projectId: string): void;
  importProject(project: WorkshopProject, options?: ImportProjectOptions): string;
  updateProject(values: Partial<ProjectMetaFields>): void;
  updateSection(sectionId: string, values: Partial<SectionMetaFields>): void;
  addSection(options?: {
    afterSectionId?: string | null;
    values?: Partial<SectionMetaFields>;
  }): string | null;
  duplicateSection(sectionId: string): string | null;
  moveSection(sectionId: string, direction: "up" | "down"): string | null;
  removeSection(sectionId: string): string | null;
  removeSections(sectionIds: string[]): string | null;
  addBlockToSection(sectionId: string, entryId: string, targetIndex?: number): string | null;
  moveBlock(
    fromSectionId: string,
    blockItemId: string,
    toSectionId: string,
    targetIndex: number,
  ): string | null;
  removeBlock(sectionId: string, blockItemId: string): void;
  updateBlockInvitation(sectionId: string, itemId: string, invitation: string): void;
  updateBlockNotes(sectionId: string, itemId: string, facilitatorNotes: string): void;
  moveSectionToDay(sectionId: string, nextDayLabel: string): void;
  renameDayLabel(currentDayLabel: string, nextDayLabel: string): void;
  updateTransition(
    sectionId: string,
    transitionId: string,
    values: Partial<Pick<TransitionItem, "note" | "durationLabel">>,
  ): void;
  updateBlockStep(
    sectionId: string,
    itemId: string,
    stepIndex: number,
    values: Partial<Pick<StepFlow, "prompt" | "facilitatorCue">>,
  ): void;
  claimProject(ownerEmail: string): Promise<boolean>;
  releaseProjectClaim(): Promise<boolean>;
  switchStorageMode(mode: ProjectStorageMode): void;
  toggleAi(): void;
  resetProject(): void;
}

const ProjectStoreContext = createContext<ProjectStoreContextValue | null>(null);

function createSeedProjectRecord(): StoredProjectRecord {
  const project = createDemoProject();

  return {
    id: project.id,
    project,
    savedAt: new Date().toISOString(),
    ownerEmail: null,
    claimedAt: null,
  };
}

function normalizeRecords(records: StoredProjectRecord[]) {
  const byId = new Map<string, StoredProjectRecord>();

  for (const record of records) {
    if (!record?.project?.id) {
      continue;
    }

    byId.set(record.project.id, {
      id: record.project.id,
      project: record.project,
      savedAt: record.savedAt,
      ownerEmail: record.ownerEmail ?? null,
      claimedAt: record.claimedAt ?? null,
    });
  }

  return Array.from(byId.values()).sort((first, second) => {
    return new Date(second.savedAt).getTime() - new Date(first.savedAt).getTime();
  });
}

function pickProjectId(
  records: StoredProjectRecord[],
  preferredIds: Array<string | null | undefined>,
) {
  for (const projectId of preferredIds) {
    if (projectId && records.some((record) => record.id === projectId)) {
      return projectId;
    }
  }

  return records[0]?.id ?? demoProjectId;
}

function getProjectIdFromPathname(pathname: string | null) {
  const match = pathname?.match(/^\/project\/([^/]+)/);

  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

function createRecordFromProject(
  project: WorkshopProject,
  previousRecord?: StoredProjectRecord | null,
) {
  return {
    id: project.id,
    project,
    savedAt: previousRecord?.savedAt ?? new Date().toISOString(),
    ownerEmail: previousRecord?.ownerEmail ?? null,
    claimedAt: previousRecord?.claimedAt ?? null,
  } satisfies StoredProjectRecord;
}

function upsertRecord(records: StoredProjectRecord[], record: StoredProjectRecord) {
  const nextRecords = records.some((candidate) => candidate.id === record.id)
    ? records.map((candidate) => (candidate.id === record.id ? record : candidate))
    : [record, ...records];

  return normalizeRecords(nextRecords);
}

function removeRecord(records: StoredProjectRecord[], projectId: string) {
  return records.filter((record) => record.id !== projectId);
}

function updateSectionItems(
  items: SectionItem[],
  itemId: string,
  invitation: string,
) {
  return items.map((item) => {
    if (item.kind !== "block" || item.id !== itemId) {
      return item;
    }

    return {
      ...item,
      invitation,
    } satisfies BlockItem;
  });
}

export function ProjectStoreProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const routeProjectId = useMemo(() => getProjectIdFromPathname(pathname), [pathname]);
  const didLoadRuntimeMode = useRef(false);
  const [projectRecords, setProjectRecords] = useState<StoredProjectRecord[]>(() => [
    createSeedProjectRecord(),
  ]);
  const [activeProjectId, setActiveProjectId] = useState(demoProjectId);
  const [storageMode, setStorageMode] = useState<ProjectStorageMode>(defaultProjectStorageMode);
  const [status, setStatus] = useState<ProjectStatus>("hydrating");
  const [saveState, setSaveState] = useState<SaveState>("idle");

  const activeRecord = useMemo(() => {
    return (
      projectRecords.find((record) => record.id === activeProjectId) ??
      projectRecords[0] ??
      createSeedProjectRecord()
    );
  }, [activeProjectId, projectRecords]);
  const project = activeRecord.project;
  const ownerEmail = activeRecord.ownerEmail ?? null;
  const lastSavedAt = activeRecord.savedAt ?? null;

  useEffect(() => {
    let active = true;

    async function hydrateProjects() {
      setStatus("hydrating");
      setSaveState("idle");

      try {
        const nextMode = didLoadRuntimeMode.current ? storageMode : loadRuntimeStorageMode();
        didLoadRuntimeMode.current = true;

        if (nextMode !== storageMode) {
          setStorageMode(nextMode);
          return;
        }

        const records = normalizeRecords(
          await getProjectStorageAdapter(nextMode).listProjects(),
        );
        const nextRecords = records.length > 0 ? records : [createSeedProjectRecord()];
        const nextActiveProjectId = pickProjectId(nextRecords, [
          routeProjectId,
          loadRuntimeActiveProjectId(),
          activeProjectId,
        ]);

        if (!active) {
          return;
        }

        setProjectRecords(nextRecords);
        setActiveProjectId(nextActiveProjectId);
        saveRuntimeActiveProjectId(nextActiveProjectId);
        setSaveState(records.length > 0 ? "saved" : "idle");
      } catch {
        if (active) {
          setSaveState("error");
        }
      } finally {
        if (active) {
          setStatus("ready");
        }
      }
    }

    void hydrateProjects();

    return () => {
      active = false;
    };
  }, [storageMode]);

  useEffect(() => {
    if (status !== "ready" || !routeProjectId) {
      return;
    }

    if (!projectRecords.some((record) => record.id === routeProjectId)) {
      return;
    }

    if (routeProjectId !== activeProjectId) {
      setActiveProjectId(routeProjectId);
    }

    saveRuntimeActiveProjectId(routeProjectId);
  }, [activeProjectId, projectRecords, routeProjectId, status]);

  useEffect(() => {
    if (status !== "ready") {
      return;
    }

    let active = true;
    setSaveState("saving");

    const timeoutId = window.setTimeout(async () => {
      try {
        const record = await getProjectStorageAdapter(storageMode).saveProject(project, {
          ownerEmail: storageMode === "server-persisted" ? ownerEmail : null,
        });

        if (!active) {
          return;
        }

        setProjectRecords((currentRecords) =>
          upsertRecord(currentRecords, {
            ...record,
            ownerEmail: record.ownerEmail ?? null,
            claimedAt: record.claimedAt ?? null,
          }),
        );
        setSaveState("saved");
      } catch {
        if (active) {
          setSaveState("error");
        }
      }
    }, 240);

    return () => {
      active = false;
      window.clearTimeout(timeoutId);
    };
  }, [ownerEmail, project, status, storageMode]);

  const value = useMemo<ProjectStoreContextValue>(
    () => {
      function setActiveProject(nextProjectId: string) {
        setActiveProjectId(nextProjectId);
        saveRuntimeActiveProjectId(nextProjectId);
      }

      function replaceProjectRecord(nextProject: WorkshopProject) {
        setProjectRecords((currentRecords) => {
          const previousRecord =
            currentRecords.find((record) => record.id === nextProject.id) ?? null;

          return upsertRecord(
            currentRecords,
            createRecordFromProject(nextProject, previousRecord),
          );
        });
      }

      function replaceActiveProject(nextProject: WorkshopProject) {
        replaceProjectRecord(nextProject);
        setActiveProject(nextProject.id);
      }

      function persistNonActiveProject(nextProject: WorkshopProject, nextOwnerEmail?: string | null) {
        void getProjectStorageAdapter(storageMode)
          .saveProject(nextProject, {
            ownerEmail: storageMode === "server-persisted" ? nextOwnerEmail ?? null : null,
          })
          .then((record) => {
            setProjectRecords((currentRecords) =>
              upsertRecord(currentRecords, {
                ...record,
                ownerEmail: record.ownerEmail ?? null,
                claimedAt: record.claimedAt ?? null,
              }),
            );
          })
          .catch(() => {
            setSaveState("error");
          });
      }

      return {
        activeProjectId,
        project,
        projectRecords,
        storageMode,
        ownerEmail,
        status,
        saveState,
        lastSavedAt,
        createProject() {
          const nextProject = createBlankProject(projectRecords.map((record) => record.id));
          replaceActiveProject(nextProject);
          return nextProject.id;
        },
        renameProject(projectId, title) {
          const normalizedTitle = title.trim();

          if (!normalizedTitle) {
            return false;
          }

          const record = projectRecords.find((candidate) => candidate.id === projectId);

          if (!record) {
            return false;
          }

          const nextProject = {
            ...record.project,
            title: normalizedTitle,
          } satisfies WorkshopProject;

          replaceProjectRecord(nextProject);

          if (projectId !== activeProjectId) {
            persistNonActiveProject(nextProject, record.ownerEmail);
          }

          return true;
        },
        duplicateProject(projectId) {
          const record = projectRecords.find((candidate) => candidate.id === projectId);

          if (!record) {
            return null;
          }

          const nextProject = duplicateWorkshopProject(
            record.project,
            projectRecords.map((candidate) => candidate.id),
          );

          replaceActiveProject(nextProject);
          return nextProject.id;
        },
        async deleteProject(projectId) {
          if (projectRecords.length <= 1) {
            return activeProjectId;
          }

          setSaveState("saving");

          try {
            await getProjectStorageAdapter(storageMode).deleteProject(projectId);
            const nextRecords = removeRecord(projectRecords, projectId);
            const nextActiveProjectId = pickProjectId(nextRecords, [
              projectId === activeProjectId ? null : activeProjectId,
              nextRecords[0]?.id,
            ]);

            setProjectRecords(nextRecords);
            setActiveProject(nextActiveProjectId);
            setSaveState("saved");
            return nextActiveProjectId;
          } catch {
            setSaveState("error");
            return null;
          }
        },
        selectProject(projectId) {
          if (projectRecords.some((record) => record.id === projectId)) {
            setActiveProject(projectId);
          }
        },
        importProject(nextProject, options) {
          const targetProjectId = options?.targetProjectId ?? null;
          const importedProject = retargetImportedProject(
            nextProject,
            projectRecords.map((record) => record.id),
            targetProjectId,
          );

          replaceActiveProject(importedProject);
          return importedProject.id;
        },
        updateProject(values) {
          replaceActiveProject({
            ...project,
            ...values,
          });
        },
        updateSection(sectionId, values) {
          replaceActiveProject(updateSectionMeta(project, sectionId, values));
        },
        addSection(options) {
          const nextProject = addSectionMutation(project, options);
          const addedSection = nextProject.sections.find(
            (section) => !project.sections.some((current) => current.id === section.id),
          );

          replaceActiveProject(nextProject);

          return addedSection?.id ?? null;
        },
        duplicateSection(sectionId) {
          const nextProject = duplicateSectionMutation(project, sectionId);
          const sourceIndex = project.sections.findIndex((section) => section.id === sectionId);
          const duplicated = nextProject.sections[sourceIndex + 1] ?? null;

          replaceActiveProject(nextProject);

          return duplicated?.id ?? null;
        },
        moveSection(sectionId, direction) {
          const nextProject = moveSectionMutation(project, sectionId, direction);
          const moved = nextProject.sections.find((section) => section.id === sectionId) ?? null;

          replaceActiveProject(nextProject);

          return moved?.id ?? null;
        },
        removeSection(sectionId) {
          const sourceIndex = project.sections.findIndex((section) => section.id === sectionId);
          const nextProject = removeSectionMutation(project, sectionId);

          if (nextProject.sections.length === project.sections.length) {
            return project.sections[sourceIndex]?.id ?? project.sections[0]?.id ?? null;
          }

          const fallbackIndex = Math.max(0, sourceIndex - 1);
          const nextActive =
            nextProject.sections[fallbackIndex] ??
            nextProject.sections[sourceIndex] ??
            nextProject.sections[0] ??
            null;

          replaceActiveProject(nextProject);

          return nextActive?.id ?? null;
        },
        removeSections(sectionIds) {
          const nextProject = removeSectionsMutation(project, sectionIds);

          if (nextProject.sections.length === project.sections.length) {
            return project.sections[0]?.id ?? null;
          }

          replaceActiveProject(nextProject);

          return nextProject.sections[0]?.id ?? null;
        },
        addBlockToSection(sectionId, entryId, targetIndex) {
          const result = addBlockToSectionMutation(project, sectionId, entryId, targetIndex);

          replaceActiveProject(result.project);

          return result.newItemId;
        },
        moveBlock(fromSectionId, blockItemId, toSectionId, targetIndex) {
          const result = moveBlockInProjectMutation(
            project,
            fromSectionId,
            blockItemId,
            toSectionId,
            targetIndex,
          );

          replaceActiveProject(result.project);

          return result.movedItemId;
        },
        removeBlock(sectionId, blockItemId) {
          replaceActiveProject(removeBlockFromSectionMutation(project, sectionId, blockItemId));
        },
        updateBlockInvitation(sectionId, itemId, invitation) {
          replaceActiveProject({
            ...project,
            sections: project.sections.map((section) =>
              section.id === sectionId
                ? {
                    ...section,
                    items: updateSectionItems(section.items, itemId, invitation),
                  }
                : section,
            ),
          });
        },
        updateBlockNotes(sectionId, itemId, facilitatorNotes) {
          replaceActiveProject(
            updateBlockNotesMutation(project, sectionId, itemId, facilitatorNotes),
          );
        },
        moveSectionToDay(sectionId, nextDayLabel) {
          replaceActiveProject(moveSectionToDayMutation(project, sectionId, nextDayLabel));
        },
        renameDayLabel(currentDayLabel, nextDayLabel) {
          replaceActiveProject(renameDayLabelMutation(project, currentDayLabel, nextDayLabel));
        },
        updateTransition(sectionId, transitionId, values) {
          replaceActiveProject(
            updateTransitionMetaMutation(project, sectionId, transitionId, values),
          );
        },
        updateBlockStep(sectionId, itemId, stepIndex, values) {
          replaceActiveProject(
            updateBlockStepMutation(project, sectionId, itemId, stepIndex, values),
          );
        },
        async claimProject(nextOwnerEmail) {
          if (storageMode !== "server-persisted") {
            return false;
          }

          const normalizedEmail = nextOwnerEmail.trim().toLowerCase();

          if (!normalizedEmail) {
            return false;
          }

          setSaveState("saving");

          try {
            const record = await getProjectStorageAdapter(storageMode).saveProject(project, {
              ownerEmail: normalizedEmail,
            });

            setProjectRecords((currentRecords) =>
              upsertRecord(currentRecords, {
                ...record,
                ownerEmail: record.ownerEmail ?? normalizedEmail,
                claimedAt: record.claimedAt ?? new Date().toISOString(),
              }),
            );
            setSaveState("saved");
            return true;
          } catch {
            setSaveState("error");
            return false;
          }
        },
        async releaseProjectClaim() {
          if (storageMode !== "server-persisted") {
            setProjectRecords((currentRecords) =>
              upsertRecord(currentRecords, {
                ...activeRecord,
                ownerEmail: null,
                claimedAt: null,
              }),
            );
            return true;
          }

          setSaveState("saving");

          try {
            const record = await getProjectStorageAdapter(storageMode).saveProject(project, {
              ownerEmail: null,
            });

            setProjectRecords((currentRecords) =>
              upsertRecord(currentRecords, {
                ...record,
                ownerEmail: null,
                claimedAt: null,
              }),
            );
            setSaveState("saved");
            return true;
          } catch {
            setSaveState("error");
            return false;
          }
        },
        switchStorageMode(mode) {
          const nextMode = saveRuntimeStorageMode(mode);

          if (nextMode === storageMode) {
            return;
          }

          setStorageMode(nextMode);
          setStatus("hydrating");
          setSaveState("idle");
        },
        toggleAi() {
          replaceActiveProject({
            ...project,
            aiEnabled: !project.aiEnabled,
          });
        },
        resetProject() {
          const resetProject = createDemoProject();

          replaceActiveProject({
            ...resetProject,
            id: project.id,
            title: project.title,
          });
        },
      };
    },
    [
      activeProjectId,
      activeRecord,
      lastSavedAt,
      ownerEmail,
      project,
      projectRecords,
      saveState,
      status,
      storageMode,
    ],
  );

  return (
    <ProjectStoreContext.Provider value={value}>
      {children}
    </ProjectStoreContext.Provider>
  );
}

export function useProjectStore() {
  const context = useContext(ProjectStoreContext);

  if (!context) {
    throw new Error("useProjectStore must be used inside ProjectStoreProvider");
  }

  return context;
}
