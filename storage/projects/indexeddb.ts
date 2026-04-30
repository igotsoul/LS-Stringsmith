import type { WorkshopProject } from "@/domain/workshop/types";
import {
  defaultProjectStorageMode,
  type ProjectStorageMode,
} from "@/storage/projects/storage-mode";

const DB_NAME = "ls-stringsmith";
const DB_VERSION = 1;
const STORE_NAMES: Record<ProjectStorageMode, string> = {
  "guest-local": "projects_guest",
  "workspace-local": "projects_workspace",
  "server-persisted": "projects_server_fallback",
};
const LOCAL_STORAGE_PREFIXES: Record<ProjectStorageMode, string> = {
  "guest-local": "lsd:guest:project:",
  "workspace-local": "lsd:workspace:project:",
  "server-persisted": "lsd:server:project:",
};
const RUNTIME_LOCAL_STORAGE_KEY = "lsd:runtime:storage-mode";
const RUNTIME_ACTIVE_PROJECT_KEY = "lsd:runtime:active-project-id";

export interface PersistedProjectRecord {
  id: string;
  project: WorkshopProject;
  savedAt: string;
  ownerEmail?: string | null;
  claimedAt?: string | null;
}

function hasIndexedDb() {
  return typeof window !== "undefined" && "indexedDB" in window;
}

function getLocalStorageKey(storageMode: ProjectStorageMode, projectId: string) {
  return `${LOCAL_STORAGE_PREFIXES[storageMode]}${projectId}`;
}

function loadFromLocalStorage(
  storageMode: ProjectStorageMode,
  projectId: string,
): PersistedProjectRecord | null {
  if (typeof window === "undefined" || !window.localStorage) {
    return null;
  }

  const raw = window.localStorage.getItem(getLocalStorageKey(storageMode, projectId));

  if (!raw) {
    return null;
  }

  return JSON.parse(raw) as PersistedProjectRecord;
}

function saveToLocalStorage(storageMode: ProjectStorageMode, record: PersistedProjectRecord) {
  if (typeof window === "undefined" || !window.localStorage) {
    return;
  }

  window.localStorage.setItem(getLocalStorageKey(storageMode, record.id), JSON.stringify(record));
}

function deleteFromLocalStorage(storageMode: ProjectStorageMode, projectId: string) {
  if (typeof window === "undefined" || !window.localStorage) {
    return;
  }

  window.localStorage.removeItem(getLocalStorageKey(storageMode, projectId));
}

function listFromLocalStorage(storageMode: ProjectStorageMode) {
  if (typeof window === "undefined" || !window.localStorage) {
    return [];
  }

  const prefix = LOCAL_STORAGE_PREFIXES[storageMode];
  const records: PersistedProjectRecord[] = [];

  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);

    if (!key?.startsWith(prefix)) {
      continue;
    }

    try {
      const raw = window.localStorage.getItem(key);

      if (raw) {
        records.push(JSON.parse(raw) as PersistedProjectRecord);
      }
    } catch {
      // Ignore unreadable local records; they should not block the rest of the list.
    }
  }

  return records;
}

function openDb() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const database = request.result;

      Object.values(STORE_NAMES).forEach((storeName) => {
        if (!database.objectStoreNames.contains(storeName)) {
          database.createObjectStore(storeName, {
            keyPath: "id",
          });
        }
      });
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function withStore<T>(
  storageMode: ProjectStorageMode,
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => Promise<T>,
) {
  const database = await openDb();
  const storeName = STORE_NAMES[storageMode];

  return new Promise<T>((resolve, reject) => {
    const transaction = database.transaction(storeName, mode);
    const store = transaction.objectStore(storeName);

    run(store)
      .then((value) => {
        transaction.oncomplete = () => {
          database.close();
          resolve(value);
        };
      })
      .catch((error) => {
        database.close();
        reject(error);
      });

    transaction.onerror = () => {
      database.close();
      reject(transaction.error);
    };
  });
}

function requestToPromise<T>(request: IDBRequest<T>) {
  return new Promise<T>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function loadPersistedProject(projectId: string) {
  return loadPersistedProjectForMode(defaultProjectStorageMode, projectId);
}

export async function loadPersistedProjectForMode(
  storageMode: ProjectStorageMode,
  projectId: string,
) {
  if (!hasIndexedDb()) {
    return loadFromLocalStorage(storageMode, projectId);
  }

  try {
    const record = await withStore(storageMode, "readonly", async (store) => {
      return requestToPromise<PersistedProjectRecord | undefined>(store.get(projectId));
    });

    return record ?? loadFromLocalStorage(storageMode, projectId);
  } catch {
    return loadFromLocalStorage(storageMode, projectId);
  }
}

export async function listPersistedProjectsForMode(storageMode: ProjectStorageMode) {
  if (!hasIndexedDb()) {
    return listFromLocalStorage(storageMode);
  }

  try {
    const records = await withStore(storageMode, "readonly", async (store) => {
      return requestToPromise<PersistedProjectRecord[]>(store.getAll());
    });

    if (records.length > 0) {
      return records;
    }

    return listFromLocalStorage(storageMode);
  } catch {
    return listFromLocalStorage(storageMode);
  }
}

export async function savePersistedProject(project: WorkshopProject) {
  return savePersistedProjectForMode(defaultProjectStorageMode, project);
}

export async function savePersistedProjectForMode(
  storageMode: ProjectStorageMode,
  project: WorkshopProject,
) {
  const record: PersistedProjectRecord = {
    id: project.id,
    project,
    savedAt: new Date().toISOString(),
  };

  saveToLocalStorage(storageMode, record);

  if (!hasIndexedDb()) {
    return record;
  }

  try {
    await withStore(storageMode, "readwrite", async (store) => {
      await requestToPromise(store.put(record));
      return undefined;
    });
  } catch {
    saveToLocalStorage(storageMode, record);
  }

  return record;
}

export async function deletePersistedProjectForMode(
  storageMode: ProjectStorageMode,
  projectId: string,
) {
  deleteFromLocalStorage(storageMode, projectId);

  if (!hasIndexedDb()) {
    return;
  }

  try {
    await withStore(storageMode, "readwrite", async (store) => {
      await requestToPromise(store.delete(projectId));
      return undefined;
    });
  } catch {
    deleteFromLocalStorage(storageMode, projectId);
  }
}

export function loadRuntimeStorageMode() {
  if (typeof window === "undefined" || !window.localStorage) {
    return defaultProjectStorageMode;
  }

  const raw = window.localStorage.getItem(RUNTIME_LOCAL_STORAGE_KEY);

  if (raw === "guest-local" || raw === "workspace-local" || raw === "server-persisted") {
    return raw;
  }

  return defaultProjectStorageMode;
}

export function saveRuntimeStorageMode(storageMode: ProjectStorageMode) {
  if (typeof window !== "undefined" && window.localStorage) {
    window.localStorage.setItem(RUNTIME_LOCAL_STORAGE_KEY, storageMode);
  }

  return storageMode;
}

export function loadRuntimeActiveProjectId() {
  if (typeof window === "undefined" || !window.localStorage) {
    return null;
  }

  return window.localStorage.getItem(RUNTIME_ACTIVE_PROJECT_KEY);
}

export function saveRuntimeActiveProjectId(projectId: string) {
  if (typeof window !== "undefined" && window.localStorage) {
    window.localStorage.setItem(RUNTIME_ACTIVE_PROJECT_KEY, projectId);
  }

  return projectId;
}
