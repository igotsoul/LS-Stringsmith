import recommendationProfileData from "@/domain/workshop/ls-recommendation-profiles.json";
import { getInspectableEntry } from "@/domain/workshop/demo-project";
import type {
  BlockItem,
  InspectableEntry,
  WorkshopProject,
  WorkshopSection,
} from "@/domain/workshop/types";

type Confidence = "low" | "medium" | "high";
type Tradeoff =
  | "shorter"
  | "safer"
  | "deeper"
  | "broader-participation"
  | "more-structured"
  | "more-energetic"
  | "more-reflective"
  | "more-action-oriented"
  | "better-for-large-groups"
  | "better-for-low-trust";

type Relation = {
  entryId: string;
  reason: string;
  confidence: Confidence;
};

type SubstituteRelation = Relation & {
  tradeoff: Tradeoff;
};

type RecommendationProfile = {
  entryId: string;
  purposeTags: string[];
  sequenceRoles: string[];
  outputTypes: string[];
  inputNeeds: string[];
  energyLevel: "low" | "medium" | "high";
  trustRequirement: "low" | "medium" | "high";
  riskLevel: "gentle" | "moderate" | "sharp";
  facilitationComplexity: "low" | "medium" | "high";
  formatFit: Array<"onsite" | "remote" | "hybrid">;
  bestWhen: string[];
  avoidWhen: string[];
  pairsWellAfter: Relation[];
  pairsWellBefore: Relation[];
  useInstead: SubstituteRelation[];
  notes: string;
  sourceConfidence: Confidence;
};

export type StructureRecommendation = {
  entry: InspectableEntry;
  reason: string;
  meta: string;
  score: number;
};

type BuildStructureRecommendationsInput = {
  entry: InspectableEntry;
  project: WorkshopProject;
  section: WorkshopSection;
  selectedBlock?: BlockItem | null;
};

const recommendationProfiles = recommendationProfileData.profiles as RecommendationProfile[];
const recommendationProfilesById = new Map(
  recommendationProfiles.map((profile) => [profile.entryId, profile]),
);

const confidenceScores: Record<Confidence, number> = {
  low: 1,
  medium: 2,
  high: 3,
};

const tradeoffLabels: Record<Tradeoff, string> = {
  shorter: "shorter",
  safer: "safer",
  deeper: "deeper",
  "broader-participation": "broader participation",
  "more-structured": "more structured",
  "more-energetic": "more energetic",
  "more-reflective": "more reflective",
  "more-action-oriented": "more action-oriented",
  "better-for-large-groups": "better for large groups",
  "better-for-low-trust": "better for low trust",
};

function normalizeWords(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/[\s-]+/)
    .filter((word) => word.length > 2);
}

function getContextWords(project: WorkshopProject, section: WorkshopSection) {
  return new Set(
    normalizeWords(
      [
        project.globalPurpose,
        project.context,
        project.desiredFeel,
        project.energyLevel ?? "",
        project.trustLevel ?? "",
        project.conflictLevel ?? "",
        project.decisionNeed ?? "",
        section.title,
        section.subgoal,
        section.prepNote,
        section.storyMeta,
      ].join(" "),
    ),
  );
}

function tagContextScore(profile: RecommendationProfile | undefined, contextWords: Set<string>) {
  if (!profile) {
    return 0;
  }

  return profile.purposeTags.reduce((score, tag) => {
    const tagWords = normalizeWords(tag);
    return score + (tagWords.some((word) => contextWords.has(word)) ? 2 : 0);
  }, 0);
}

function getSelectedBlockPosition(section: WorkshopSection, selectedBlock?: BlockItem | null) {
  if (!selectedBlock) {
    return {
      blockCount: section.items.filter((item) => item.kind === "block").length,
      index: -1,
    };
  }

  const blocks = section.items.filter((item): item is BlockItem => item.kind === "block");

  return {
    blockCount: blocks.length,
    index: blocks.findIndex((block) => block.id === selectedBlock.id),
  };
}

function directionScore(kind: "before" | "after", index: number, blockCount: number) {
  if (index < 0) {
    return kind === "after" ? 2 : 0;
  }

  if (kind === "after" && index >= blockCount - 1) {
    return 4;
  }

  if (kind === "before" && index > 0) {
    return 2;
  }

  return 0;
}

function isRecommendableEntry(entry: InspectableEntry) {
  return entry.kind !== "transition";
}

function isStructureRecommendation(
  recommendation: StructureRecommendation | null,
): recommendation is StructureRecommendation {
  return recommendation !== null;
}

function recommendationMeta(parts: string[]) {
  return parts.filter(Boolean).join(" · ");
}

function getEntrySafely(entryId: string) {
  try {
    return getInspectableEntry(entryId);
  } catch {
    return null;
  }
}

function dedupeAndSort(recommendations: StructureRecommendation[], limit: number) {
  const bestByEntryId = new Map<string, StructureRecommendation>();

  for (const recommendation of recommendations) {
    const current = bestByEntryId.get(recommendation.entry.id);

    if (!current || recommendation.score > current.score) {
      bestByEntryId.set(recommendation.entry.id, recommendation);
    }
  }

  return [...bestByEntryId.values()]
    .sort(
      (left, right) =>
        right.score - left.score || left.entry.title.localeCompare(right.entry.title),
    )
    .slice(0, limit);
}

function getSectionEntryIds(section: WorkshopSection) {
  return new Set(
    section.items
      .filter((item): item is BlockItem => item.kind === "block")
      .map((item) => item.entryId),
  );
}

function excludeEntryIds(
  recommendations: StructureRecommendation[],
  excludedEntryIds: Set<string>,
) {
  return recommendations.filter((recommendation) => !excludedEntryIds.has(recommendation.entry.id));
}

function buildPairRecommendation(
  relation: Relation,
  kind: "before" | "after",
  input: BuildStructureRecommendationsInput,
  index: number,
  blockCount: number,
  contextWords: Set<string>,
): StructureRecommendation | null {
  const entry = getEntrySafely(relation.entryId);

  if (!entry || !isRecommendableEntry(entry)) {
    return null;
  }

  const profile = recommendationProfilesById.get(entry.id);
  const sectionSuggestionScore = input.section.suggestedEntryIds.includes(entry.id) ? 6 : 0;
  const score =
    confidenceScores[relation.confidence] * 10 +
    directionScore(kind, index, blockCount) +
    tagContextScore(profile, contextWords) +
    sectionSuggestionScore;
  const directionLabel = kind === "before" ? "before this" : "after this";

  return {
    entry,
    reason: relation.reason,
    meta: recommendationMeta([directionLabel, `${relation.confidence} confidence`]),
    score,
  };
}

function buildSubstituteRecommendation(
  relation: SubstituteRelation,
  input: BuildStructureRecommendationsInput,
  contextWords: Set<string>,
): StructureRecommendation | null {
  const entry = getEntrySafely(relation.entryId);

  if (!entry || !isRecommendableEntry(entry)) {
    return null;
  }

  const profile = recommendationProfilesById.get(entry.id);
  const sectionSuggestionScore = input.section.suggestedEntryIds.includes(entry.id) ? 4 : 0;

  return {
    entry,
    reason: relation.reason,
    meta: recommendationMeta([
      tradeoffLabels[relation.tradeoff],
      `${relation.confidence} confidence`,
    ]),
    score:
      confidenceScores[relation.confidence] * 10 +
      tagContextScore(profile, contextWords) +
      sectionSuggestionScore,
  };
}

function fallbackRecommendations(
  entryIds: string[] | undefined,
  meta: string,
): StructureRecommendation[] {
  return (entryIds ?? [])
    .map(getEntrySafely)
    .filter((entry): entry is InspectableEntry => Boolean(entry))
    .filter(isRecommendableEntry)
    .map((entry, index) => ({
      entry,
      reason: entry.libraryDescription ?? entry.shortDescription,
      meta,
      score: 10 - index,
    }));
}

export function buildStructureRecommendations(input: BuildStructureRecommendationsInput) {
  const profile = recommendationProfilesById.get(input.entry.id);
  const contextWords = getContextWords(input.project, input.section);
  const { index, blockCount } = getSelectedBlockPosition(input.section, input.selectedBlock);
  const existingSectionEntryIds = getSectionEntryIds(input.section);

  if (!profile) {
    const fallbackPairs = fallbackRecommendations(input.entry.relatedEntryIds, "curated relation");
    const fallbackAlternatives = fallbackRecommendations(
      input.entry.alternativeEntryIds,
      "curated alternative",
    );
    const pairsWellWith = excludeEntryIds(fallbackPairs, existingSectionEntryIds);
    const visiblePairEntryIds = new Set(pairsWellWith.map((recommendation) => recommendation.entry.id));

    return {
      pairsWellWith,
      useInstead: excludeEntryIds(
        fallbackAlternatives,
        new Set([...existingSectionEntryIds, ...visiblePairEntryIds]),
      ),
    };
  }

  const pairsWellWith = dedupeAndSort(
    excludeEntryIds(
      [
        ...profile.pairsWellAfter
          .map((relation) =>
            buildPairRecommendation(relation, "before", input, index, blockCount, contextWords),
          )
          .filter(isStructureRecommendation),
        ...profile.pairsWellBefore
          .map((relation) =>
            buildPairRecommendation(relation, "after", input, index, blockCount, contextWords),
          )
          .filter(isStructureRecommendation),
      ],
      existingSectionEntryIds,
    ),
    4,
  );
  const visiblePairEntryIds = new Set(pairsWellWith.map((recommendation) => recommendation.entry.id));

  const useInstead = dedupeAndSort(
    excludeEntryIds(
      profile.useInstead
        .map((relation) => buildSubstituteRecommendation(relation, input, contextWords))
        .filter(isStructureRecommendation),
      new Set([...existingSectionEntryIds, ...visiblePairEntryIds]),
    ),
    3,
  );

  return {
    pairsWellWith,
    useInstead,
  };
}
