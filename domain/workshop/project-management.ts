import { createDemoProject } from "@/domain/workshop/demo-project";
import type { WorkshopProject } from "@/domain/workshop/types";

function slugify(value: string) {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "project";
}

export function createUniqueProjectId(
  title: string,
  existingProjectIds: Iterable<string>,
) {
  const existing = new Set(existingProjectIds);
  const baseId = slugify(title);

  if (!existing.has(baseId)) {
    return baseId;
  }

  let index = 2;
  let candidate = `${baseId}-${index}`;

  while (existing.has(candidate)) {
    index += 1;
    candidate = `${baseId}-${index}`;
  }

  return candidate;
}

export function cloneWorkshopProject(project: WorkshopProject) {
  return JSON.parse(JSON.stringify(project)) as WorkshopProject;
}

export function createBlankProject(existingProjectIds: Iterable<string>) {
  const title = "Untitled workshop";
  const project = createDemoProject();

  return {
    ...project,
    id: createUniqueProjectId(title, existingProjectIds),
    title,
    globalPurpose: "Describe the purpose this workshop should serve.",
    context: "Add the background and constraints that matter for this group.",
    targetAudience: "Workshop participants",
    durationLabel: "1.5 hrs",
    energyLevel: "Medium",
    trustLevel: "Unknown",
    conflictLevel: "Low",
    decisionNeed: "Explore options",
    projectPulse: [
      "Fresh project created from the starter workshop shape.",
      "Frame the purpose, then refine sections in the builder.",
    ],
  } satisfies WorkshopProject;
}

export function duplicateWorkshopProject(
  project: WorkshopProject,
  existingProjectIds: Iterable<string>,
) {
  const title = `${project.title} copy`;
  const duplicatedProject = cloneWorkshopProject(project);

  return {
    ...duplicatedProject,
    id: createUniqueProjectId(title, existingProjectIds),
    title,
  } satisfies WorkshopProject;
}

export function retargetImportedProject(
  project: WorkshopProject,
  existingProjectIds: Iterable<string>,
  targetProjectId?: string | null,
) {
  if (targetProjectId) {
    return {
      ...cloneWorkshopProject(project),
      id: targetProjectId,
    } satisfies WorkshopProject;
  }

  const existing = new Set(existingProjectIds);
  const importedProject = cloneWorkshopProject(project);

  return {
    ...importedProject,
    id: existing.has(importedProject.id)
      ? createUniqueProjectId(importedProject.title, existing)
      : importedProject.id,
  } satisfies WorkshopProject;
}
