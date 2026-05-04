import { getInspectableEntry } from "@/domain/workshop/demo-project";
import { getReviewProvider } from "@/domain/workshop/review-provider";
import { getRuntimeCapabilities } from "@/domain/workshop/runtime-capabilities";
import type { BlockItem, WorkshopProject } from "@/domain/workshop/types";

function escapeInline(value: string) {
  return value.replace(/\n+/g, " ").trim();
}

export function exportProjectMarkdown(project: WorkshopProject) {
  const lines: string[] = [];
  const runtime = getRuntimeCapabilities(project);
  const reviewProvider = getReviewProvider(project);
  const workshopReview = project.aiEnabled ? reviewProvider.reviewWorkshop(project) : null;

  lines.push("---");
  lines.push(`title: ${JSON.stringify(project.title)}`);
  lines.push(`language: ${JSON.stringify(project.language)}`);
  lines.push(`duration: ${JSON.stringify(project.durationLabel ?? "")}`);
  lines.push(`format: ${JSON.stringify(project.format)}`);
  lines.push(`participants: ${JSON.stringify(project.participantsLabel)}`);
  lines.push(`ai_enabled: ${project.aiEnabled}`);
  lines.push(`review_provider: ${JSON.stringify(runtime.reviewProviderLabel)}`);
  lines.push(`sections: ${project.sections.length}`);
  if (workshopReview) {
    lines.push(`workshop_review_label: ${JSON.stringify(workshopReview.label)}`);
    lines.push(`workshop_review_score: ${JSON.stringify(workshopReview.score)}`);
  } else {
    lines.push(`workshop_review_label: null`);
    lines.push(`workshop_review_score: null`);
  }
  lines.push("---");
  lines.push("");
  lines.push(`# ${project.title}`);
  lines.push("");
  lines.push(`**Global purpose:** ${escapeInline(project.globalPurpose)}`);
  lines.push("");
  lines.push(`**Context:** ${escapeInline(project.context)}`);
  lines.push("");
  lines.push(
    `**Frame:** ${escapeInline(
      [
        project.durationLabel,
        project.format,
        project.participantsLabel,
        project.targetAudience,
      ]
        .filter(Boolean)
        .join(" · "),
    )}`,
  );
  lines.push("");
  lines.push(
    `**Group dynamics:** ${escapeInline(
      [
        project.energyLevel ? `Energy: ${project.energyLevel}` : "",
        project.trustLevel ? `Trust: ${project.trustLevel}` : "",
        project.conflictLevel ? `Conflict: ${project.conflictLevel}` : "",
        project.decisionNeed ? `Decision need: ${project.decisionNeed}` : "",
      ]
        .filter(Boolean)
        .join(" · "),
    )}`,
  );
  lines.push("");
  if (workshopReview) {
    lines.push(`## Workshop review`);
    lines.push("");
    lines.push(`- Label: ${workshopReview.label}`);
    lines.push(`- Score: ${workshopReview.score}`);
    lines.push(`- Summary: ${escapeInline(workshopReview.summary)}`);
    if (workshopReview.highlights.length) {
      lines.push(`- Highlights:`);
      for (const highlight of workshopReview.highlights) {
        lines.push(`  - ${escapeInline(highlight)}`);
      }
    }
    if (workshopReview.suggestions.length) {
      lines.push(`- Suggestions:`);
      for (const suggestion of workshopReview.suggestions) {
        lines.push(`  - ${escapeInline(suggestion)}`);
      }
    }
    lines.push("");
  } else {
    lines.push(`## Workshop review`);
    lines.push("");
    lines.push(`- Status: AI assistance disabled for this project`);
    lines.push(`- Note: ${escapeInline(runtime.reviewDisabledNote)}`);
    lines.push("");
  }

  for (const section of project.sections) {
    const sectionReview = project.aiEnabled ? reviewProvider.reviewSection(section) : null;
    lines.push(`## Section ${section.indexLabel}: ${section.title}`);
    lines.push("");
    lines.push(`- Day: ${section.dayLabel}`);
    lines.push(`- Subgoal: ${escapeInline(section.subgoal)}`);
    lines.push(`- Prep note: ${escapeInline(section.prepNote)}`);
    lines.push(`- Duration: ${section.totalLabel}`);
    lines.push(`- Status: ${section.status}`);
    if (section.notes?.trim()) {
      lines.push(`- Section notes: ${escapeInline(section.notes)}`);
    }
    if (sectionReview) {
      lines.push(`- Review label: ${sectionReview.label}`);
      lines.push(`- Review score: ${sectionReview.score}`);
      lines.push(`- Review summary: ${escapeInline(sectionReview.summary)}`);
      if (sectionReview.highlights.length) {
        lines.push(`- Highlights:`);
        for (const highlight of sectionReview.highlights) {
          lines.push(`  - ${escapeInline(highlight)}`);
        }
      }
      if (sectionReview.suggestions.length) {
        lines.push(`- Suggestions:`);
        for (const suggestion of sectionReview.suggestions) {
          lines.push(`  - ${escapeInline(suggestion)}`);
        }
      }
    }
    lines.push("");

    if (section.items.length === 0) {
      lines.push("_Draft section - blocks still to be added._");
      lines.push("");
      continue;
    }

    for (const item of section.items) {
      if (item.kind === "transition") {
        lines.push(`### Transition`);
        lines.push("");
        lines.push(`- Duration: ${item.durationLabel}`);
        lines.push(`- Note: ${escapeInline(item.note)}`);
        lines.push("");
        continue;
      }

      const block = item as BlockItem;
      const entry = getInspectableEntry(item.entryId);

      lines.push(`### ${entry.title}`);
      lines.push("");
      lines.push(`- Type: ${entry.typeLabel}`);
      lines.push(`- Duration: ${block.durationLabel}`);
      lines.push(`- Invitation: ${escapeInline(block.invitation)}`);

      if (block.flowSummary) {
        lines.push(`- Flow: ${escapeInline(block.flowSummary)}`);
      }

      if (block.facilitatorCue) {
        lines.push(`- Facilitator cue: ${escapeInline(block.facilitatorCue)}`);
      }

      if (block.facilitatorNotes?.trim()) {
        lines.push(`- Facilitator notes: ${escapeInline(block.facilitatorNotes)}`);
      }

      if (block.warning) {
        lines.push(`- Review note: ${escapeInline(block.warning)}`);
      }

      lines.push("");

      const steps = block.steps ?? entry.steps;

      if (steps?.length) {
        lines.push(`#### Structure flow`);
        lines.push("");

        for (const step of steps) {
          lines.push(`- ${step.title.replace(/^\d+\.\s*/, "")}`);

          if (step.prompt) {
            lines.push(`  Prompt: ${escapeInline(step.prompt)}`);
          }

          lines.push(`  Cue: ${escapeInline(step.facilitatorCue)}`);
        }

        lines.push("");
      }
    }
  }

  return `${lines.join("\n").trim()}\n`;
}
