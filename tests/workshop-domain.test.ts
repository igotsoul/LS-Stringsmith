import assert from "node:assert/strict";
import test from "node:test";

import { exportProjectMarkdown } from "@/domain/workshop/export-markdown";
import {
  inspectProjectBundle,
  parseProjectBundle,
  serializeProjectBundle,
} from "@/domain/workshop/project-bundle";
import {
  addSection,
  addBlockToSection,
  moveSectionToDay,
  removeSection,
  removeBlockFromSection,
  renameDayLabel,
  updateBlockNotes,
  updateSectionMeta,
} from "@/domain/workshop/project-mutations";
import { createDemoProject } from "@/domain/workshop/demo-project";
import type { BlockItem, TransitionItem } from "@/domain/workshop/types";

function getBlock(project: ReturnType<typeof createDemoProject>, sectionId: string, blockId: string) {
  const section = project.sections.find((candidate) => candidate.id === sectionId);
  const item = section?.items.find((candidate) => candidate.id === blockId);

  assert.ok(section, `Expected section ${sectionId} to exist.`);
  assert.equal(item?.kind, "block", `Expected ${blockId} to be a block item.`);

  return item as BlockItem;
}

test("section notes and block facilitator notes persist and export", () => {
  let project = createDemoProject();

  project = updateSectionMeta(project, "section-1", {
    notes: "Bring extra markers and watch the emotional temperature.",
  });
  project = updateBlockNotes(
    project,
    "section-1",
    "section-1-intro",
    "Keep this setup warm and brief.",
  );

  const section = project.sections.find((candidate) => candidate.id === "section-1");
  const block = getBlock(project, "section-1", "section-1-intro");
  const markdown = exportProjectMarkdown(project);

  assert.equal(section?.notes, "Bring extra markers and watch the emotional temperature.");
  assert.equal(block.facilitatorNotes, "Keep this setup warm and brief.");
  assert.match(markdown, /Section notes: Bring extra markers/);
  assert.match(markdown, /Facilitator notes: Keep this setup warm and brief/);
});

test("day rename and section movement keep day groups contiguous", () => {
  let project = createDemoProject();

  project = addSection(project, {
    values: {
      dayLabel: "Day 2",
      subgoal: "Plan the first follow-up check after the demo workshop.",
      title: "Follow-up check",
    },
  });
  const followUpSectionId = project.sections[1]?.id;

  assert.ok(followUpSectionId);

  project = renameDayLabel(project, "Day 2", "Follow-up day");
  project = moveSectionToDay(project, "section-1", "Follow-up day");

  assert.deepEqual(
    project.sections.map((section) => section.id),
    [followUpSectionId, "section-1"],
  );
  assert.deepEqual(
    project.sections.map((section) => section.indexLabel),
    ["01", "02"],
  );
  assert.equal(project.sections[1]?.dayLabel, "Follow-up day");
});

test("block add and remove rebuild transition chain deterministically", () => {
  const start = addSection(createDemoProject(), {
    values: {
      title: "Scratch section",
    },
  });
  const scratchSectionId = start.sections[1]?.id;

  assert.ok(scratchSectionId);

  const firstAdd = addBlockToSection(start, scratchSectionId, "intro");

  assert.ok(firstAdd.newItemId);

  const secondAdd = addBlockToSection(firstAdd.project, scratchSectionId, "reflection");
  const section = secondAdd.project.sections.find((candidate) => candidate.id === scratchSectionId);

  assert.deepEqual(
    section?.items.map((item) => item.kind),
    ["block", "transition", "block"],
  );
  assert.match((section?.items[1] as TransitionItem).note, /Bridge from Intro \/ Context/);

  const removed = removeBlockFromSection(secondAdd.project, scratchSectionId, firstAdd.newItemId);
  const rebuiltSection = removed.sections.find((candidate) => candidate.id === scratchSectionId);

  assert.deepEqual(
    rebuiltSection?.items.map((item) => item.kind),
    ["block"],
  );
  assert.equal(rebuiltSection?.totalLabel, "8 min chain");
});

test("section removal keeps at least one workshop section", () => {
  const project = createDemoProject();
  const singleSectionProject = {
    ...project,
    sections: [project.sections[0]!],
  };
  const nextProject = removeSection(singleSectionProject, "section-1");

  assert.equal(nextProject.sections.length, 1);
  assert.equal(nextProject.sections[0]?.id, "section-1");
});

test("project bundle inspection accepts current bundles and rejects malformed input", () => {
  const project = createDemoProject();
  const rawBundle = serializeProjectBundle(project, { exportedFrom: "guest-local" });
  const inspection = inspectProjectBundle(rawBundle);

  assert.equal(inspection.canImport, true);
  assert.equal(inspection.error, null);
  assert.equal(inspection.metadata?.projectId, project.id);
  assert.equal(inspection.metadata?.sectionCount, project.sections.length);
  assert.equal(parseProjectBundle(rawBundle).id, project.id);

  const invalidInspection = inspectProjectBundle("{not valid json");

  assert.equal(invalidInspection.canImport, false);
  assert.match(invalidInspection.error ?? "", /not valid JSON/);

  const emptyProjectInspection = inspectProjectBundle(
    serializeProjectBundle({ ...project, sections: [] }, { exportedFrom: "guest-local" }),
  );

  assert.equal(emptyProjectInspection.canImport, false);
  assert.match(emptyProjectInspection.error ?? "", /does not contain any sections/);
});
