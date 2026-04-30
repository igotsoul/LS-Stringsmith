import { getInspectableEntry } from "@/domain/workshop/demo-project";
import type {
  BlockItem,
  ReviewTone,
  TransitionItem,
  WorkshopProject,
  WorkshopSection,
} from "@/domain/workshop/types";

export interface ReviewInsight {
  label: string;
  score: string;
  tone: ReviewTone;
  summary: string;
  why: string;
  fitCues: string[];
  suggestions: string[];
}

export interface SectionReviewInsight {
  label: string;
  score: string;
  tone: ReviewTone;
  summary: string;
  highlights: string[];
  suggestions: string[];
}

export interface WorkshopReviewInsight {
  label: string;
  score: string;
  tone: ReviewTone;
  summary: string;
  highlights: string[];
  suggestions: string[];
}

const stopwords = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "by",
  "for",
  "from",
  "how",
  "if",
  "in",
  "into",
  "is",
  "it",
  "of",
  "on",
  "or",
  "our",
  "so",
  "that",
  "the",
  "their",
  "this",
  "to",
  "we",
  "what",
  "when",
  "which",
  "with",
  "you",
  "your",
]);

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function parseWords(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function keywordSet(text: string) {
  return new Set(parseWords(text).filter((word) => word.length > 2 && !stopwords.has(word)));
}

function keywordOverlap(a: string, b: string) {
  const left = keywordSet(a);
  const right = keywordSet(b);

  if (!left.size || !right.size) {
    return 0;
  }

  let overlap = 0;

  left.forEach((word) => {
    if (right.has(word)) {
      overlap += 1;
    }
  });

  return overlap;
}

function wordCount(text: string) {
  return parseWords(text).length;
}

function sentenceCount(text: string) {
  return text
    .split(/[.!?]+/)
    .map((part) => part.trim())
    .filter(Boolean).length;
}

function hasPromptVerb(text: string) {
  return /\b(what|how|which|share|name|list|tell|identify|notice|reflect|describe|state)\b/i.test(
    text,
  );
}

function toneBase(tone: ReviewTone) {
  switch (tone) {
    case "success":
      return 4.3;
    case "info":
      return 3.8;
    case "warning":
      return 3.2;
    default:
      return 3.7;
  }
}

function toneFromScore(score: number): ReviewTone {
  if (score >= 4.15) {
    return "success";
  }

  if (score >= 3.45) {
    return "info";
  }

  return "warning";
}

function labelFromScore(score: number) {
  if (score >= 4.4) {
    return "Strong fit";
  }

  if (score >= 4) {
    return "Good fit";
  }

  if (score >= 3.45) {
    return "Promising fit";
  }

  return "Needs another pass";
}

function scoreLabel(score: number) {
  return `${score.toFixed(1)} / 5`;
}

function invitationQualityScore(text: string) {
  const words = wordCount(text);
  const sentences = sentenceCount(text);
  const promptVerb = hasPromptVerb(text);
  const hasQuestion = text.includes("?");
  let score = 3.4;

  if (words >= 8 && words <= 24) {
    score += 0.55;
  } else if (words > 30) {
    score -= 0.45;
  } else if (words < 5) {
    score -= 0.3;
  }

  if (sentences === 1) {
    score += 0.25;
  } else if (sentences > 2) {
    score -= 0.35;
  }

  if (promptVerb) {
    score += 0.35;
  }

  if (hasQuestion) {
    score += 0.2;
  }

  if ((text.match(/\band\b/gi) ?? []).length >= 3) {
    score -= 0.25;
  }

  return clamp(score, 2.4, 4.8);
}

function getBlocks(section: WorkshopSection) {
  return section.items.filter((item): item is BlockItem => item.kind === "block");
}

function getTransitions(section: WorkshopSection) {
  return section.items.filter((item): item is TransitionItem => item.kind === "transition");
}

function getPreviousTransition(section: WorkshopSection, blockId: string) {
  const blocks = getBlocks(section);
  const transitions = getTransitions(section);
  const blockIndex = blocks.findIndex((block) => block.id === blockId);

  if (blockIndex <= 0) {
    return null;
  }

  return transitions[blockIndex - 1] ?? null;
}

export function reviewEntryFallback(entryId: string): ReviewInsight {
  const entry = getInspectableEntry(entryId);

  return {
    label: entry.reviewSummary.label,
    score: entry.reviewSummary.score,
    tone: entry.reviewSummary.tone,
    summary: entry.review,
    why: entry.description,
    fitCues: entry.fitCues,
    suggestions: entry.suggestions,
  };
}

export function reviewBlockInSection(
  section: WorkshopSection,
  block: BlockItem,
): ReviewInsight {
  const entry = getInspectableEntry(block.entryId);
  const purposeSeed = `${entry.shortDescription} ${entry.description} ${entry.output} ${entry.fitCues.join(" ")}`;
  const purposeOverlap = keywordOverlap(section.subgoal, purposeSeed);
  const purposeScore = clamp(
    toneBase(entry.reviewSummary.tone) + Math.min(purposeOverlap, 4) * 0.12,
    2.8,
    4.8,
  );
  const inviteScore = invitationQualityScore(block.invitation);
  const previousTransition = getPreviousTransition(section, block.id);
  const transitionScore = previousTransition
    ? wordCount(previousTransition.note) >= 7
      ? 4.2
      : 3.2
    : 4.2;
  const overall = clamp((purposeScore + inviteScore + transitionScore) / 3, 2.8, 4.8);
  const suggestions = new Set<string>();

  if (wordCount(block.invitation) > 26) {
    suggestions.add("Tighten the invitation so participants can absorb it in one pass.");
  }

  if (sentenceCount(block.invitation) > 2) {
    suggestions.add("Reduce the invitation to one main move before adding nuance.");
  }

  if (!hasPromptVerb(block.invitation)) {
    suggestions.add("Use a more direct prompt verb so the next action feels clearer.");
  }

  if (previousTransition && wordCount(previousTransition.note) < 7) {
    suggestions.add("Strengthen the bridge note so the handoff explains what carries forward.");
  }

  entry.suggestions.slice(0, 2).forEach((suggestion) => suggestions.add(suggestion));

  const purposeLine =
    purposeOverlap > 0
      ? "Purpose fit is strong because the section subgoal and this structure pull in the same direction."
      : "Purpose fit is decent, though the section subgoal could be echoed more explicitly in the invitation.";
  const invitationLine =
    inviteScore >= 4.1
      ? "Invitation quality is strong: the current wording is focused and easy to act on."
      : inviteScore >= 3.5
        ? "Invitation quality is workable, but it could be tighter and easier to process in the room."
        : "Invitation quality is weak right now because the wording asks for too much at once.";
  const transitionLine = previousTransition
    ? transitionScore >= 4
      ? "Transition fit is healthy because the bridge note gives participants a clear carry-forward cue."
      : "Transition fit is only partial because the bridge note still feels too thin."
    : "Transition fit is naturally strong because this block opens the section.";

  return {
    label: labelFromScore(overall),
    score: scoreLabel(overall),
    tone: toneFromScore(overall),
    summary: `${purposeLine} ${invitationLine} ${transitionLine}`,
    why:
      purposeOverlap > 0
        ? `This block supports "${section.subgoal}" because it creates a specific move toward ${entry.fitCues[0]} and ${entry.fitCues[1]}.`
        : entry.description,
    fitCues: entry.fitCues,
    suggestions: Array.from(suggestions).slice(0, 4),
  };
}

export function reviewTransitionInSection(
  section: WorkshopSection,
  transition: TransitionItem,
): ReviewInsight {
  const words = wordCount(transition.note);
  const blocks = getBlocks(section);
  const transitions = getTransitions(section);
  const transitionIndex = transitions.findIndex((item) => item.id === transition.id);
  const previous = blocks[transitionIndex];
  const next = blocks[transitionIndex + 1];
  const score = clamp(
    3.3 +
      (words >= 7 ? 0.7 : 0) +
      (/\b(into|from|carry|next|shift)\b/i.test(transition.note) ? 0.35 : 0),
    2.9,
    4.6,
  );
  const suggestions = new Set<string>();

  if (words < 7) {
    suggestions.add("Name what the room should carry from the previous move into the next one.");
  }

  if (!/\b(into|from|carry|next|shift)\b/i.test(transition.note)) {
    suggestions.add("Use one explicit bridge verb so the handoff feels intentional.");
  }

  return {
    label: labelFromScore(score),
    score: scoreLabel(score),
    tone: toneFromScore(score),
    summary:
      score >= 4
        ? "This bridge is clear enough to keep the section moving without losing context."
        : "The bridge works, but it could explain the carry-forward logic more explicitly.",
    why:
      previous && next
        ? `This transition links ${previous.entryId === next.entryId ? "repeated moves" : "two distinct moves"} and helps the room understand why ${getInspectableEntry(previous.entryId).title} leads into ${getInspectableEntry(next.entryId).title}.`
        : "This transition keeps the local LS chain coherent.",
    fitCues: ["bridge", "carry forward", "sequence clarity"],
    suggestions: Array.from(suggestions),
  };
}

export function reviewSection(section: WorkshopSection): SectionReviewInsight {
  const blocks = getBlocks(section);
  const transitions = getTransitions(section);
  const firstEntry = blocks[0] ? getInspectableEntry(blocks[0].entryId) : null;
  const firstToneScore =
    firstEntry?.kind === "neutral" ||
    firstEntry?.matchmakerCategory === "share" ||
    firstEntry?.matchmakerCategory === "reveal"
      ? 4.35
      : 3.55;
  const structureScore =
    blocks.length >= 3 ? 4.35 : blocks.length === 2 ? 4.0 : blocks.length === 1 ? 3.2 : 2.6;
  const bridgeScore =
    blocks.length <= 1
      ? 3.2
      : transitions.length === blocks.length - 1 &&
          transitions.every((transition) => wordCount(transition.note) >= 7)
        ? 4.15
        : 3.35;
  const invitationAverage =
    blocks.length > 0
      ? blocks.reduce((sum, block) => sum + invitationQualityScore(block.invitation), 0) /
        blocks.length
      : 2.9;
  const overall = clamp(
    (structureScore + firstToneScore + bridgeScore + invitationAverage) / 4,
    2.6,
    4.7,
  );
  const highlights: string[] = [];
  const suggestions = new Set<string>();

  if (firstEntry) {
    highlights.push(`Starts with ${firstEntry.title}, which sets the tone for the section.`);
  }

  if (blocks.length > 1) {
    highlights.push(`${blocks.length} blocks are chained with ${transitions.length} bridge moves.`);
  }

  if (bridgeScore >= 4) {
    highlights.push("Transitions are explicit enough to preserve momentum between structures.");
  } else if (blocks.length > 1) {
    suggestions.add("Strengthen one or two bridge notes so the sequence feels less abrupt.");
  }

  if (invitationAverage < 3.7) {
    suggestions.add("At least one invitation still feels too long or multi-part for live facilitation.");
  } else {
    highlights.push("Invitations are mostly readable at workshop pace.");
  }

  if (!(firstEntry?.kind === "neutral" || firstEntry?.matchmakerCategory === "share" || firstEntry?.matchmakerCategory === "reveal")) {
    suggestions.add("Consider a gentler opening move if you want the section to warm up more gradually.");
  }

  if (blocks.length < 2) {
    suggestions.add("Add one more block so the section has a clearer local arc.");
  }

  return {
    label: labelFromScore(overall),
    score: scoreLabel(overall),
    tone: toneFromScore(overall),
    summary:
      overall >= 4.1
        ? "This section has a clear local arc and should be easy to facilitate with only light polishing."
        : overall >= 3.5
          ? "This section is workable, but one or two parts still need sharper sequencing or cleaner wording."
          : "This section is still drafty and would benefit from clearer structure before facilitation.",
    highlights,
    suggestions: Array.from(suggestions).slice(0, 4),
  };
}

export function reviewWorkshop(project: WorkshopProject): WorkshopReviewInsight {
  const sectionReviews = project.sections.map((section) => reviewSection(section));
  const sectionsWithFlow = project.sections.filter((section) => getBlocks(section).length > 0);
  const draftSections = project.sections.filter((section) => getBlocks(section).length === 0);
  const dayGroups = new Set(project.sections.map((section) => section.dayLabel));
  const avgSectionScore =
    sectionReviews.reduce((sum, review) => sum + Number.parseFloat(review.score), 0) /
    Math.max(sectionReviews.length, 1);
  const draftPenalty = draftSections.length * 0.3;
  const shapeBonus =
    sectionsWithFlow.length >= 2 && dayGroups.size >= 1
      ? 0.2
      : 0;
  const overall = clamp(avgSectionScore - draftPenalty + shapeBonus, 2.8, 4.7);
  const highlights: string[] = [];
  const suggestions = new Set<string>();
  const warningSections = project.sections.filter(
    (_section, index) => sectionReviews[index]?.tone === "warning",
  );
  const infoSections = project.sections.filter(
    (_section, index) => sectionReviews[index]?.tone === "info",
  );

  highlights.push(
    `${project.sections.length} sections are mapped across ${dayGroups.size} day group${dayGroups.size === 1 ? "" : "s"}.`,
  );

  if (sectionsWithFlow.length > 0) {
    highlights.push(
      `${sectionsWithFlow.length} section${sectionsWithFlow.length === 1 ? "" : "s"} already carry a working LS chain.`,
    );
  }

  if (draftSections.length === 0) {
    highlights.push("All sections currently have a facilitation path instead of a pure placeholder.");
  } else {
    suggestions.add(
      `${draftSections.length} section${draftSections.length === 1 ? "" : "s"} still need a first concrete chain before export feels reliable.`,
    );
  }

  if (warningSections.length > 0) {
    suggestions.add(
      `Review the sharper section${warningSections.length === 1 ? "" : "s"} again so tone and sequencing stay workable across the whole workshop.`,
    );
  } else if (infoSections.length > 0) {
    suggestions.add("One or two sections would benefit from tighter invitations or stronger bridges before facilitation.");
  } else {
    highlights.push("The overall flow is already fairly coherent from warm-up into more demanding work.");
  }

  if (!project.sections.some((section) => getBlocks(section)[0] && getInspectableEntry(getBlocks(section)[0].entryId).kind === "neutral")) {
    suggestions.add("Consider one explicit framing or grounding move near the start to ease participants into the workshop.");
  }

  return {
    label: labelFromScore(overall),
    score: scoreLabel(overall),
    tone: toneFromScore(overall),
    summary:
      overall >= 4.1
        ? "The workshop is taking shape as a coherent multi-section journey and mainly needs refinement, not restructuring."
        : overall >= 3.5
          ? "The workshop direction is solid, but a few sections still need clearer sequencing before the whole flow feels dependable."
          : "The workshop has a promising skeleton, but it still needs stronger section-level definition before facilitation will feel easy.",
    highlights,
    suggestions: Array.from(suggestions).slice(0, 4),
  };
}

export function sharpenInvitation(block: BlockItem) {
  const entry = getInspectableEntry(block.entryId);
  const stepPrompt =
    block.steps?.find((step) => step.prompt)?.prompt ??
    entry.steps?.find((step) => step.prompt)?.prompt;

  if (stepPrompt) {
    return {
      learningPoints: [
        "Use the structure's clearest step prompt when it already gives participants a focused first move.",
      ],
      needsChange: stepPrompt.trim() !== block.invitation.trim(),
      text: stepPrompt,
      rationale: "Pulled the clearest step prompt into the working invitation.",
    };
  }

  const compactText = block.invitation
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .slice(0, 1)
    .join(" ")
    .trim();

  return {
    learningPoints: [
      "A shorter invitation is easier to hear and act on in the room.",
    ],
    needsChange: compactText !== block.invitation.trim(),
    text: compactText || `Draft invitation for ${entry.title}.`,
    rationale: "Trimmed the invitation to a single clear move.",
  };
}
