export type ProjectStorageMode =
  | "guest-local"
  | "workspace-local"
  | "server-persisted";

export interface StorageModeDetails {
  id: ProjectStorageMode;
  label: string;
  shortLabel: string;
  description: string;
  savedLabel: string;
  importingLabel: string;
  cardLabel: string;
}

export const defaultProjectStorageMode: ProjectStorageMode = "guest-local";

export function getStorageModeDetails(mode: ProjectStorageMode): StorageModeDetails {
  if (mode === "server-persisted") {
    return {
      id: mode,
      label: "Server draft",
      shortLabel: "Server",
      description:
        "A real server-backed draft stored by the running app instance. This is the seam future auth and claiming can build on.",
      savedLabel: "Saved to server",
      importingLabel: "server draft",
      cardLabel: "Server draft",
    };
  }

  if (mode === "workspace-local") {
    return {
      id: mode,
      label: "Workspace draft",
      shortLabel: "Workspace",
      description:
        "A browser-stored persisted draft that prepares the later account-backed storage flow without leaving this device yet.",
      savedLabel: "Saved to workspace",
      importingLabel: "workspace draft",
      cardLabel: "Workspace draft",
    };
  }

  return {
    id: mode,
    label: "Guest local",
    shortLabel: "Guest",
    description:
      "A browser-local draft for fast, no-login workshop design in the current browser.",
    savedLabel: "Saved locally",
    importingLabel: "local draft",
    cardLabel: "Local draft",
  };
}

export const projectStorageModes: ProjectStorageMode[] = [
  "guest-local",
  "workspace-local",
  "server-persisted",
];
