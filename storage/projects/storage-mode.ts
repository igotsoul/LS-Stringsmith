export type ProjectStorageMode =
  | "guest-local"
  | "workspace-local"
  | "server-persisted";

export interface StorageModeDetails {
  id: ProjectStorageMode;
  label: string;
  shortLabel: string;
  description: string;
  questionLabel: string;
  questionHelp: string;
  savedLabel: string;
  importingLabel: string;
  cardLabel: string;
}

export const defaultProjectStorageMode: ProjectStorageMode = "guest-local";

export type RuntimeTarget = "local-app" | "hosted-demo";

function getRuntimeTargetOverride(): RuntimeTarget | null {
  const value = process.env.NEXT_PUBLIC_LSD_RUNTIME_TARGET;

  if (value === "local-app" || value === "hosted-demo") {
    return value;
  }

  return null;
}

export function getClientRuntimeTarget(): RuntimeTarget {
  const override = getRuntimeTargetOverride();

  if (override) {
    return override;
  }

  if (typeof window === "undefined") {
    return "hosted-demo";
  }

  const hostname = window.location.hostname;
  const isLocalHost =
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "::1" ||
    hostname.endsWith(".localhost");

  return isLocalHost ? "local-app" : "hosted-demo";
}

export function getAvailableProjectStorageModes(
  runtimeTarget: RuntimeTarget = getClientRuntimeTarget(),
): ProjectStorageMode[] {
  if (runtimeTarget === "local-app") {
    return projectStorageModes;
  }

  return ["guest-local", "workspace-local"];
}

export function normalizeProjectStorageModeForRuntime(
  mode: ProjectStorageMode,
  runtimeTarget: RuntimeTarget = getClientRuntimeTarget(),
) {
  return getAvailableProjectStorageModes(runtimeTarget).includes(mode)
    ? mode
    : defaultProjectStorageMode;
}

export function getStorageModeDetails(mode: ProjectStorageMode): StorageModeDetails {
  if (mode === "server-persisted") {
    return {
      id: mode,
      label: "Server draft",
      shortLabel: "Server",
      description:
        "A real server-backed draft stored by the running app instance. This is the seam future auth and claiming can build on.",
      questionLabel: "I am running this locally and want to test server drafts.",
      questionHelp:
        "Stores projects in SQLite on this app instance. Good for local/self-host checks, not for a public serverless demo.",
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
      questionLabel: "I want a safe demo workspace in this browser.",
      questionHelp:
        "Keeps demo projects in this browser, separate from quick guest drafts. Other visitors cannot see or overwrite them.",
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
    questionLabel: "I just want to try it in this browser.",
    questionHelp:
      "Fastest path for demo users. Nothing leaves this browser; export a bundle if you want to keep or move the work.",
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
