import packageJson from "@/package.json";
import type { WorkshopProject } from "@/domain/workshop/types";
import type { ProjectStorageMode } from "@/storage/projects/storage-mode";

const BUNDLE_VERSION = 2;
const APP_LABEL = "LS Stringsmith";

export interface ProjectBundleMetadata {
  aiEnabled: boolean;
  appVersion: string;
  blockCount: number;
  exportedAt: string;
  exportedFrom: ProjectStorageMode | "unknown";
  format: string;
  language: string;
  projectId: string;
  sectionCount: number;
  transitionCount: number;
}

export interface ProjectBundle {
  app: typeof APP_LABEL;
  metadata: ProjectBundleMetadata;
  project: WorkshopProject;
  schemaVersion: number;
}

export interface ProjectBundleInspection {
  appLabel: string;
  canImport: boolean;
  error: string | null;
  metadata: ProjectBundleMetadata | null;
  project: WorkshopProject | null;
  schemaVersion: number | null;
  warnings: string[];
}

interface LegacyProjectBundle {
  app?: string;
  exportedAt?: string;
  project?: unknown;
  schemaVersion?: number;
}

function isWorkshopProject(value: unknown): value is WorkshopProject {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<WorkshopProject>;

  return (
    typeof candidate.id === "string" &&
    typeof candidate.title === "string" &&
    typeof candidate.globalPurpose === "string" &&
    Array.isArray(candidate.sections)
  );
}

function summarizeProject(project: WorkshopProject) {
  let blockCount = 0;
  let transitionCount = 0;

  for (const section of project.sections) {
    for (const item of section.items) {
      if (item.kind === "block") {
        blockCount += 1;
      } else {
        transitionCount += 1;
      }
    }
  }

  return {
    aiEnabled: project.aiEnabled,
    blockCount,
    format: project.format,
    language: project.language,
    projectId: project.id,
    sectionCount: project.sections.length,
    transitionCount,
  };
}

function buildBundleMetadata(
  project: WorkshopProject,
  options?: { exportedFrom?: ProjectStorageMode | "unknown"; exportedAt?: string },
): ProjectBundleMetadata {
  return {
    ...summarizeProject(project),
    appVersion: packageJson.version,
    exportedAt: options?.exportedAt ?? new Date().toISOString(),
    exportedFrom: options?.exportedFrom ?? "unknown",
  };
}

function normalizeExportedFrom(value: unknown): ProjectStorageMode | "unknown" {
  if (
    value === "guest-local" ||
    value === "workspace-local" ||
    value === "server-persisted"
  ) {
    return value;
  }

  return "unknown";
}

function createLegacyWarning(schemaVersion: number | null) {
  if (schemaVersion === null) {
    return "This bundle did not include an explicit schema version. Missing metadata was derived from the project payload.";
  }

  return "This bundle uses an older schema. Missing metadata was derived from the project payload.";
}

function normalizeMetadata(
  project: WorkshopProject,
  parsed: Partial<ProjectBundle>,
  warnings: string[],
): ProjectBundleMetadata {
  const fallbackExportedAt =
    typeof parsed.metadata?.exportedAt === "string"
      ? parsed.metadata.exportedAt
      : typeof (parsed as LegacyProjectBundle).exportedAt === "string"
        ? (parsed as LegacyProjectBundle).exportedAt!
        : new Date().toISOString();
  const derivedMetadata = buildBundleMetadata(project, {
    exportedAt: fallbackExportedAt,
    exportedFrom: normalizeExportedFrom(parsed.metadata?.exportedFrom),
  });

  if (!parsed.metadata) {
    warnings.push(createLegacyWarning(typeof parsed.schemaVersion === "number" ? parsed.schemaVersion : null));
    return derivedMetadata;
  }

  const metadata = parsed.metadata;

  if (typeof metadata.appVersion !== "string") {
    warnings.push("Bundle metadata is missing the exporting app version.");
  }

  if (metadata.sectionCount !== undefined && metadata.sectionCount !== derivedMetadata.sectionCount) {
    warnings.push("Section count metadata did not match the payload. Using the project payload instead.");
  }

  if (metadata.blockCount !== undefined && metadata.blockCount !== derivedMetadata.blockCount) {
    warnings.push("Block count metadata did not match the payload. Using the project payload instead.");
  }

  if (
    metadata.transitionCount !== undefined &&
    metadata.transitionCount !== derivedMetadata.transitionCount
  ) {
    warnings.push("Transition count metadata did not match the payload. Using the project payload instead.");
  }

  return {
    aiEnabled:
      typeof metadata.aiEnabled === "boolean" ? metadata.aiEnabled : derivedMetadata.aiEnabled,
    appVersion:
      typeof metadata.appVersion === "string" ? metadata.appVersion : derivedMetadata.appVersion,
    blockCount: derivedMetadata.blockCount,
    exportedAt:
      typeof metadata.exportedAt === "string" ? metadata.exportedAt : derivedMetadata.exportedAt,
    exportedFrom: normalizeExportedFrom(metadata.exportedFrom),
    format: typeof metadata.format === "string" ? metadata.format : derivedMetadata.format,
    language:
      typeof metadata.language === "string" ? metadata.language : derivedMetadata.language,
    projectId:
      typeof metadata.projectId === "string" ? metadata.projectId : derivedMetadata.projectId,
    sectionCount: derivedMetadata.sectionCount,
    transitionCount: derivedMetadata.transitionCount,
  };
}

export function buildProjectBundle(
  project: WorkshopProject,
  options?: { exportedFrom?: ProjectStorageMode | "unknown" },
) {
  return {
    app: APP_LABEL,
    metadata: buildBundleMetadata(project, {
      exportedFrom: options?.exportedFrom,
    }),
    project,
    schemaVersion: BUNDLE_VERSION,
  } satisfies ProjectBundle;
}

export function serializeProjectBundle(
  project: WorkshopProject,
  options?: { exportedFrom?: ProjectStorageMode | "unknown" },
) {
  return JSON.stringify(buildProjectBundle(project, options), null, 2);
}

export function inspectProjectBundle(raw: string): ProjectBundleInspection {
  let parsed: Partial<ProjectBundle> | LegacyProjectBundle;

  try {
    parsed = JSON.parse(raw) as Partial<ProjectBundle> | LegacyProjectBundle;
  } catch {
    return {
      appLabel: APP_LABEL,
      canImport: false,
      error: "This file is not valid JSON.",
      metadata: null,
      project: null,
      schemaVersion: null,
      warnings: [],
    };
  }

  const warnings: string[] = [];
  const schemaVersion = typeof parsed.schemaVersion === "number" ? parsed.schemaVersion : null;
  const appLabel = typeof parsed.app === "string" ? parsed.app : APP_LABEL;

  if (appLabel !== APP_LABEL) {
    warnings.push(`This bundle was exported from "${appLabel}" instead of "${APP_LABEL}".`);
  }

  if (!isWorkshopProject(parsed.project)) {
    return {
      appLabel,
      canImport: false,
      error: "The bundle is missing a valid workshop project payload.",
      metadata: null,
      project: null,
      schemaVersion,
      warnings,
    };
  }

  const project = parsed.project;

  if (project.sections.length === 0) {
    return {
      appLabel,
      canImport: false,
      error: "The project payload does not contain any sections.",
      metadata: null,
      project: null,
      schemaVersion,
      warnings,
    };
  }

  if (schemaVersion !== null && schemaVersion > BUNDLE_VERSION) {
    warnings.push(
      `This bundle uses schema version ${schemaVersion}, which is newer than the current importer (${BUNDLE_VERSION}).`,
    );
  }

  const metadata = normalizeMetadata(project, parsed as Partial<ProjectBundle>, warnings);

  return {
    appLabel,
    canImport: true,
    error: null,
    metadata,
    project,
    schemaVersion,
    warnings,
  };
}

export function parseProjectBundle(raw: string) {
  const inspection = inspectProjectBundle(raw);

  if (!inspection.canImport || !inspection.project) {
    throw new Error(inspection.error ?? "Invalid project bundle.");
  }

  return inspection.project;
}
