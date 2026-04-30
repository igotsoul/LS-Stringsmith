import type { WorkshopProject } from "@/domain/workshop/types";
import {
  deletePersistedProjectForMode,
  listPersistedProjectsForMode,
  loadPersistedProjectForMode,
  savePersistedProjectForMode,
} from "@/storage/projects/indexeddb";
import type { ProjectStorageMode } from "@/storage/projects/storage-mode";

export interface StoredProjectRecord {
  id: string;
  project: WorkshopProject;
  savedAt: string;
  ownerEmail?: string | null;
  claimedAt?: string | null;
}

export interface ProjectStorageAdapter {
  deleteProject(projectId: string): Promise<void>;
  listProjects(): Promise<StoredProjectRecord[]>;
  loadProject(projectId: string): Promise<StoredProjectRecord | null>;
  saveProject(
    project: WorkshopProject,
    options?: { ownerEmail?: string | null },
  ): Promise<StoredProjectRecord>;
}

function createBrowserAdapter(storageMode: ProjectStorageMode): ProjectStorageAdapter {
  return {
    deleteProject(projectId) {
      return deletePersistedProjectForMode(storageMode, projectId);
    },
    listProjects() {
      return listPersistedProjectsForMode(storageMode);
    },
    loadProject(projectId) {
      return loadPersistedProjectForMode(storageMode, projectId);
    },
    async saveProject(project) {
      const record = await savePersistedProjectForMode(storageMode, project);
      return {
        id: project.id,
        project,
        savedAt: record.savedAt,
        ownerEmail: record.ownerEmail ?? null,
        claimedAt: record.claimedAt ?? null,
      };
    },
  };
}

function createServerAdapter(): ProjectStorageAdapter {
  return {
    async deleteProject(projectId) {
      const response = await fetch(`/api/persisted-projects/${projectId}`, {
        method: "DELETE",
      });

      if (!response.ok && response.status !== 404) {
        throw new Error("Could not delete project from server storage.");
      }
    },
    async listProjects() {
      const response = await fetch("/api/persisted-projects", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Could not list projects from server storage.");
      }

      return (await response.json()) as StoredProjectRecord[];
    },
    async loadProject(projectId) {
      const response = await fetch(`/api/persisted-projects/${projectId}`, {
        cache: "no-store",
      });

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error("Could not load project from server storage.");
      }

      return (await response.json()) as StoredProjectRecord;
    },
    async saveProject(project, options) {
      const response = await fetch(`/api/persisted-projects/${project.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          project,
          ownerEmail: options?.ownerEmail ?? null,
        }),
      });

      if (!response.ok) {
        throw new Error("Could not save project to server storage.");
      }

      return (await response.json()) as StoredProjectRecord;
    },
  };
}

export function getProjectStorageAdapter(storageMode: ProjectStorageMode): ProjectStorageAdapter {
  if (storageMode === "server-persisted") {
    return createServerAdapter();
  }

  return createBrowserAdapter(storageMode);
}
