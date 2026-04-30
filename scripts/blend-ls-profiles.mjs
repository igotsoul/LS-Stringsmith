import { readFile, writeFile } from "node:fs/promises";

const inputModels = [
  {
    id: "claude",
    batch: 1,
    path: "../docs/llm-output/ls-profiles-batch-1-claude.json",
  },
  {
    id: "gemini",
    batch: 1,
    path: "../docs/llm-output/ls-profiles-batch-1-gemini.json",
  },
  {
    id: "gpt",
    batch: 1,
    path: "../docs/llm-output/ls-profiles-batch-1-gpt.json",
  },
  {
    id: "claude",
    batch: 2,
    path: "../docs/llm-output/ls-profiles-batch-2-claude.json",
  },
  {
    id: "claude",
    batch: 3,
    path: "../docs/llm-output/ls-profiles-batch-3-claude.json",
  },
  {
    id: "claude",
    batch: 4,
    path: "../docs/llm-output/ls-profiles-batch-4-claude.json",
  },
  {
    id: "claude",
    batch: 5,
    path: "../docs/llm-output/ls-profiles-batch-5-claude.json",
  },
];

const outputUrls = [
  new URL("../docs/llm-output/ls-profiles-combined.json", import.meta.url),
  new URL("../domain/workshop/ls-recommendation-profiles.json", import.meta.url),
];

const expectedProfileOrder = [
  "intro",
  "input",
  "reflection",
  "124all",
  "appreciative",
  "triz",
  "winfy",
  "what-so-what-now-what",
  "nine-whys",
  "impromptu-networking",
  "conversation-cafe",
  "15percent-solutions",
  "25-10-crowd-sourcing",
  "mad-tea-party",
  "spiral-journal",
  "xxn-writing",
  "drawing-together",
  "folding-spectogram",
  "wicked-questions",
  "tiny-demons",
  "anxiety-circus",
  "agreement-and-certainty-matrix",
  "ecocycle-planning",
  "panarchy",
  "generative-relationships-star",
  "network-patterning-cards",
  "simple-ethnography",
  "min-specs",
  "integrated-autonomy",
  "troika-consulting",
  "wise-crowds",
  "wise-crowds-fur-grosse-gruppen",
  "helping-heuristics",
  "heard-seen-respected",
  "grief-walking",
  "social-network-webbing",
  "discovery-and-action-dialogue-dad",
  "talking-with-pixies",
  "celebrity-interview",
  "gallery-walk",
  "shift-and-share",
  "user-experience-fishbowl",
  "open-space-technology",
  "critical-uncertainties",
  "design-storyboards",
  "design-storyboards-advanced",
  "purpose-to-practice-p2p",
  "improv-prototyping",
];

const allowedEntryIds = new Set([
  "intro",
  "input",
  "reflection",
  "124all",
  "15percent-solutions",
  "25-10-crowd-sourcing",
  "nine-whys",
  "anxiety-circus",
  "appreciative",
  "agreement-and-certainty-matrix",
  "celebrity-interview",
  "conversation-cafe",
  "critical-uncertainties",
  "design-storyboards",
  "design-storyboards-advanced",
  "discovery-and-action-dialogue-dad",
  "drawing-together",
  "ecocycle-planning",
  "folding-spectogram",
  "gallery-walk",
  "generative-relationships-star",
  "grief-walking",
  "heard-seen-respected",
  "helping-heuristics",
  "impromptu-networking",
  "improv-prototyping",
  "integrated-autonomy",
  "mad-tea-party",
  "min-specs",
  "network-patterning-cards",
  "open-space-technology",
  "panarchy",
  "purpose-to-practice-p2p",
  "shift-and-share",
  "simple-ethnography",
  "social-network-webbing",
  "spiral-journal",
  "talking-with-pixies",
  "tiny-demons",
  "triz",
  "troika-consulting",
  "user-experience-fishbowl",
  "winfy",
  "what-so-what-now-what",
  "wicked-questions",
  "wise-crowds",
  "wise-crowds-fur-grosse-gruppen",
  "xxn-writing",
]);

const vocabularies = {
  purposeTags: new Set([
    "safety",
    "connection",
    "inclusion",
    "divergence",
    "idea-generation",
    "sensemaking",
    "pattern-detection",
    "reflection",
    "debrief",
    "decision",
    "prioritization",
    "commitment",
    "action-planning",
    "strategy",
    "systems-thinking",
    "help",
    "knowledge-sharing",
    "relationship-mapping",
    "conflict-surfacing",
    "constraints",
    "experimentation",
    "innovation",
    "purpose-clarity",
  ]),
  sequenceRoles: new Set([
    "opener",
    "warm-up",
    "discover",
    "diverge",
    "deepen",
    "analyze",
    "synthesize",
    "decide",
    "plan",
    "commit",
    "close",
    "bridge",
    "expert-input",
  ]),
  outputTypes: new Set([
    "shared-context",
    "questions",
    "stories",
    "ideas",
    "options",
    "patterns",
    "insights",
    "priorities",
    "decisions",
    "requests",
    "agreements",
    "actions",
    "prototypes",
    "principles",
    "maps",
    "constraints",
  ]),
  inputNeeds: new Set([
    "clear-purpose",
    "challenge-question",
    "personal-experience",
    "existing-data",
    "stakeholder-roles",
    "prior-output",
    "examples",
    "problem-list",
    "options-list",
    "decision-context",
    "high-trust",
    "physical-space",
    "expertise",
    "none",
  ]),
  formatFit: new Set(["onsite", "remote", "hybrid"]),
};

const scaleValues = new Set(["low", "medium", "high"]);
const riskValues = new Set(["gentle", "moderate", "sharp"]);
const confidenceValues = new Set(["low", "medium", "high"]);
const tradeoffValues = new Set([
  "shorter",
  "safer",
  "deeper",
  "broader-participation",
  "more-structured",
  "more-energetic",
  "more-reflective",
  "more-action-oriented",
  "better-for-large-groups",
  "better-for-low-trust",
]);

const confidenceScore = {
  low: 1,
  medium: 2,
  high: 3,
};

const relationLimits = {
  pairsWellAfter: 4,
  pairsWellBefore: 4,
  useInstead: 3,
};

function normalizeJsonText(value) {
  return value
    .replaceAll("\u201c", "\"")
    .replaceAll("\u201d", "\"")
    .replaceAll("\u2018", "'")
    .replaceAll("\u2019", "'");
}

function normalizeText(value) {
  return String(value ?? "")
    .replaceAll("\u201c", "\"")
    .replaceAll("\u201d", "\"")
    .replaceAll("\u2018", "'")
    .replaceAll("\u2019", "'")
    .replaceAll("\u2013", "-")
    .replaceAll("\u2014", "-")
    .replaceAll("\u2026", "...");
}

async function readModel(model) {
  const url = new URL(model.path, import.meta.url);
  const raw = await readFile(url, "utf8");
  const normalized = normalizeJsonText(raw);
  const data = JSON.parse(normalized);

  return {
    id: model.id,
    batch: model.batch,
    profiles: data.profiles,
    requiredQuoteNormalization: raw !== normalized,
  };
}

function cleanVocabularyList(values, vocabulary, context, issues) {
  if (!Array.isArray(values)) {
    issues.push(`${context} is not an array`);
    return [];
  }

  return [...new Set(values.filter((value) => {
    if (!vocabulary.has(value)) {
      issues.push(`${context} has invalid value "${value}"`);
      return false;
    }

    return true;
  }))];
}

function cleanRelationList(values, entryId, kind, issues) {
  if (!Array.isArray(values)) {
    issues.push(`${entryId}.${kind} is not an array`);
    return [];
  }

  const bestByTarget = new Map();

  for (const relation of values) {
    if (!relation || typeof relation !== "object") {
      issues.push(`${entryId}.${kind} contains a non-object relation`);
      continue;
    }

    if (!allowedEntryIds.has(relation.entryId)) {
      issues.push(`${entryId}.${kind} references unknown entry "${relation.entryId}"`);
      continue;
    }

    if (relation.entryId === entryId) {
      issues.push(`${entryId}.${kind} references itself`);
      continue;
    }

    if (!confidenceValues.has(relation.confidence)) {
      issues.push(`${entryId}.${kind}.${relation.entryId} has invalid confidence`);
      continue;
    }

    if (kind === "useInstead" && !tradeoffValues.has(relation.tradeoff)) {
      issues.push(`${entryId}.${kind}.${relation.entryId} has invalid tradeoff "${relation.tradeoff}"`);
      continue;
    }

    const cleanRelation = {
      entryId: relation.entryId,
      reason: normalizeText(relation.reason).slice(0, 160),
      confidence: relation.confidence,
    };

    if (kind === "useInstead") {
      cleanRelation.tradeoff = relation.tradeoff;
    }

    const previous = bestByTarget.get(cleanRelation.entryId);

    if (
      !previous ||
      confidenceScore[cleanRelation.confidence] > confidenceScore[previous.confidence]
    ) {
      bestByTarget.set(cleanRelation.entryId, cleanRelation);
    }
  }

  return [...bestByTarget.values()];
}

function cleanProfile(profile, modelId, issues) {
  if (!profile?.entryId) {
    issues.push(`${modelId} has a profile without entryId`);
    return null;
  }

  return {
    ...profile,
    purposeTags: cleanVocabularyList(
      profile.purposeTags,
      vocabularies.purposeTags,
      `${modelId}.${profile.entryId}.purposeTags`,
      issues,
    ),
    sequenceRoles: cleanVocabularyList(
      profile.sequenceRoles,
      vocabularies.sequenceRoles,
      `${modelId}.${profile.entryId}.sequenceRoles`,
      issues,
    ),
    outputTypes: cleanVocabularyList(
      profile.outputTypes,
      vocabularies.outputTypes,
      `${modelId}.${profile.entryId}.outputTypes`,
      issues,
    ),
    inputNeeds: cleanVocabularyList(
      profile.inputNeeds,
      vocabularies.inputNeeds,
      `${modelId}.${profile.entryId}.inputNeeds`,
      issues,
    ),
    formatFit: cleanVocabularyList(
      profile.formatFit,
      vocabularies.formatFit,
      `${modelId}.${profile.entryId}.formatFit`,
      issues,
    ),
    pairsWellAfter: cleanRelationList(
      profile.pairsWellAfter,
      profile.entryId,
      "pairsWellAfter",
      issues,
    ),
    pairsWellBefore: cleanRelationList(
      profile.pairsWellBefore,
      profile.entryId,
      "pairsWellBefore",
      issues,
    ),
    useInstead: cleanRelationList(profile.useInstead, profile.entryId, "useInstead", issues),
    bestWhen: Array.isArray(profile.bestWhen) ? profile.bestWhen.map(normalizeText) : [],
    avoidWhen: Array.isArray(profile.avoidWhen) ? profile.avoidWhen.map(normalizeText) : [],
    notes: normalizeText(profile.notes),
  };
}

function addSourceValue(valuesByModel, modelId, profile, key) {
  const values = profile?.[key] ?? [];

  for (const value of values) {
    if (!valuesByModel.has(value)) {
      valuesByModel.set(value, new Set());
    }

    valuesByModel.get(value).add(modelId);
  }
}

function blendList(key, profilesByModel) {
  const valuesByModel = new Map();

  for (const [modelId, profile] of profilesByModel) {
    addSourceValue(valuesByModel, modelId, profile, key);
  }

  const baseValues = profilesByModel.get("claude")?.[key] ?? [];
  const baseValueSet = new Set(baseValues);
  const blended = [];

  for (const value of baseValues) {
    const sources = valuesByModel.get(value) ?? new Set(["claude"]);

    if (baseValueSet.has(value) || sources.size >= 2) {
      blended.push(value);
    }
  }

  const consensusExtras = [...valuesByModel.entries()]
    .filter(([value, sources]) => !baseValueSet.has(value) && sources.size >= 2)
    .sort(([leftValue, leftSources], [rightValue, rightSources]) => {
      return rightSources.size - leftSources.size || leftValue.localeCompare(rightValue);
    })
    .map(([value]) => value);

  return [...new Set([...blended, ...consensusExtras])];
}

function mostCommonScalar(key, profilesByModel, allowedValues, fallback) {
  const counts = new Map();

  for (const profile of profilesByModel.values()) {
    const value = profile?.[key];

    if (!allowedValues.has(value)) {
      continue;
    }

    counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  const sorted = [...counts.entries()].sort(([leftValue, leftCount], [rightValue, rightCount]) => {
    return rightCount - leftCount || leftValue.localeCompare(rightValue);
  });

  return sorted[0]?.[1] > 1 ? sorted[0][0] : profilesByModel.get("claude")?.[key] ?? fallback;
}

function chooseReason(votes) {
  const claudeVote = votes.find((vote) => vote.modelId === "claude" && vote.confidence !== "low");

  if (claudeVote) {
    return claudeVote.reason;
  }

  return [...votes].sort((left, right) => {
    return (
      confidenceScore[right.confidence] - confidenceScore[left.confidence] ||
      left.reason.length - right.reason.length
    );
  })[0].reason;
}

function chooseTradeoff(votes) {
  const tradeoffCounts = new Map();

  for (const vote of votes) {
    tradeoffCounts.set(vote.tradeoff, (tradeoffCounts.get(vote.tradeoff) ?? 0) + 1);
  }

  const consensus = [...tradeoffCounts.entries()]
    .filter(([, count]) => count > 1)
    .sort(([leftValue, leftCount], [rightValue, rightCount]) => {
      return rightCount - leftCount || leftValue.localeCompare(rightValue);
    })[0]?.[0];

  if (consensus) {
    return consensus;
  }

  return votes.find((vote) => vote.modelId === "claude")?.tradeoff ?? votes[0].tradeoff;
}

function blendedConfidence(votes) {
  const highVotes = votes.filter((vote) => vote.confidence === "high").length;

  if ((votes.length === 3 && highVotes >= 2) || (votes.length === 2 && highVotes === 2)) {
    return "high";
  }

  if (votes.length >= 2) {
    return "medium";
  }

  return votes[0].confidence;
}

function relationScore(relation) {
  const modelBonus = relation.votes.some((vote) => vote.modelId === "claude") ? 1.5 : 0;
  const precisionBonus = relation.votes.some((vote) => vote.modelId === "gemini") ? 0.5 : 0;

  return (
    relation.votes.length * 4 +
    relation.votes.reduce((sum, vote) => sum + confidenceScore[vote.confidence], 0) +
    modelBonus +
    precisionBonus
  );
}

function blendRelations(kind, profilesByModel) {
  const relationVotes = new Map();

  for (const [modelId, profile] of profilesByModel) {
    for (const relation of profile?.[kind] ?? []) {
      const key = relation.entryId;

      if (!relationVotes.has(key)) {
        relationVotes.set(key, []);
      }

      relationVotes.get(key).push({
        ...relation,
        modelId,
      });
    }
  }

  const candidates = [...relationVotes.entries()].map(([entryId, votes]) => {
    return {
      entryId,
      votes,
      score: relationScore({ votes }),
    };
  });

  return candidates
    .filter((candidate) => {
      const hasClaude = candidate.votes.some((vote) => vote.modelId === "claude");
      const bestConfidence = Math.max(...candidate.votes.map((vote) => confidenceScore[vote.confidence]));

      return candidate.votes.length >= 2 || (hasClaude && bestConfidence >= confidenceScore.medium);
    })
    .sort((left, right) => right.score - left.score || left.entryId.localeCompare(right.entryId))
    .slice(0, relationLimits[kind])
    .map((candidate) => {
      const blended = {
        entryId: candidate.entryId,
        reason: chooseReason(candidate.votes),
        confidence: blendedConfidence(candidate.votes),
      };

      if (kind === "useInstead") {
        blended.tradeoff = chooseTradeoff(candidate.votes);
      }

      return blended;
    });
}

function profileSourceConfidence(profilesByModel) {
  const sourceCount = profilesByModel.size;
  const highCount = [...profilesByModel.values()].filter(
    (profile) => profile.sourceConfidence === "high",
  ).length;

  if (sourceCount >= 3 && highCount >= 2) {
    return "high";
  }

  if (sourceCount >= 2) {
    return "medium";
  }

  return profilesByModel.get("claude")?.sourceConfidence ?? "low";
}

function blendProfile(entryId, profilesByModel) {
  const base = profilesByModel.get("claude") ?? profilesByModel.values().next().value;

  return {
    entryId,
    purposeTags: blendList("purposeTags", profilesByModel),
    sequenceRoles: blendList("sequenceRoles", profilesByModel),
    outputTypes: blendList("outputTypes", profilesByModel),
    inputNeeds: blendList("inputNeeds", profilesByModel),
    energyLevel: mostCommonScalar("energyLevel", profilesByModel, scaleValues, "medium"),
    trustRequirement: mostCommonScalar("trustRequirement", profilesByModel, scaleValues, "medium"),
    riskLevel: mostCommonScalar("riskLevel", profilesByModel, riskValues, "moderate"),
    facilitationComplexity: mostCommonScalar(
      "facilitationComplexity",
      profilesByModel,
      scaleValues,
      "medium",
    ),
    formatFit: blendList("formatFit", profilesByModel),
    bestWhen: base.bestWhen ?? [],
    avoidWhen: base.avoidWhen ?? [],
    pairsWellAfter: blendRelations("pairsWellAfter", profilesByModel),
    pairsWellBefore: blendRelations("pairsWellBefore", profilesByModel),
    useInstead: blendRelations("useInstead", profilesByModel),
    notes: base.notes ?? "",
    sourceConfidence: profileSourceConfidence(profilesByModel),
  };
}

function findProfile(profiles, entryId) {
  const profile = profiles.find((candidate) => candidate.entryId === entryId);

  if (!profile) {
    throw new Error(`Cannot apply curation for missing profile ${entryId}`);
  }

  return profile;
}

function removeRelation(profile, kind, entryId) {
  profile[kind] = profile[kind].filter((relation) => relation.entryId !== entryId);
}

function upsertRelation(profile, kind, relation) {
  removeRelation(profile, kind, relation.entryId);
  profile[kind].push(relation);
}

function applyCuratedOverrides(profiles, issues) {
  const triz = findProfile(profiles, "triz");
  removeRelation(triz, "pairsWellAfter", "intro");
  removeRelation(triz, "useInstead", "tiny-demons");
  upsertRelation(triz, "useInstead", {
    entryId: "wicked-questions",
    reason: "Surfaces paradoxes without moving as directly into stop-doing behavior.",
    confidence: "medium",
    tradeoff: "safer",
  });

  const oneTwoFourAll = findProfile(profiles, "124all");
  upsertRelation(oneTwoFourAll, "useInstead", {
    entryId: "conversation-cafe",
    reason: "Use when the group needs deeper dialogue rather than rapid synthesis.",
    confidence: "high",
    tradeoff: "deeper",
  });

  const winfy = findProfile(profiles, "winfy");
  removeRelation(winfy, "pairsWellAfter", "purpose-to-practice-p2p");
  removeRelation(winfy, "useInstead", "generative-relationships-star");
  upsertRelation(winfy, "useInstead", {
    entryId: "troika-consulting",
    reason: "Gives practical help with lower exposure than direct cross-functional requests.",
    confidence: "high",
    tradeoff: "safer",
  });

  issues.push("applied curated recommendation overrides for triz, 124all, and winfy");
}

const modelData = await Promise.all(inputModels.map(readModel));
const issues = [];
const profilesByEntry = new Map();

for (const model of modelData) {
  if (model.requiredQuoteNormalization) {
    issues.push(`${model.id} batch ${model.batch} required smart quote normalization`);
  }

  for (const rawProfile of model.profiles) {
    const profile = cleanProfile(rawProfile, model.id, issues);

    if (!profile) {
      continue;
    }

    if (!profilesByEntry.has(profile.entryId)) {
      profilesByEntry.set(profile.entryId, new Map());
    }

    profilesByEntry.get(profile.entryId).set(model.id, profile);
  }
}

const profiles = expectedProfileOrder.map((entryId) => {
  const profilesByModel = profilesByEntry.get(entryId);

  if (!profilesByModel) {
    throw new Error(`Missing profile for ${entryId}`);
  }

  return blendProfile(entryId, profilesByModel);
});

const unexpectedProfiles = [...profilesByEntry.keys()].filter(
  (entryId) => !expectedProfileOrder.includes(entryId),
);

if (unexpectedProfiles.length > 0) {
  issues.push(`ignored unexpected profiles: ${unexpectedProfiles.join(", ")}`);
}

applyCuratedOverrides(profiles, issues);

for (const outputUrl of outputUrls) {
  await writeFile(outputUrl, `${JSON.stringify({ profiles }, null, 2)}\n`);
}

const relationCount = profiles.reduce(
  (counts, profile) => {
    counts.pairsWellAfter += profile.pairsWellAfter.length;
    counts.pairsWellBefore += profile.pairsWellBefore.length;
    counts.useInstead += profile.useInstead.length;
    return counts;
  },
  {
    pairsWellAfter: 0,
    pairsWellBefore: 0,
    useInstead: 0,
  },
);

console.log(`Wrote ${outputUrls.map((url) => url.pathname).join(", ")}`);
console.log(`Profiles: ${profiles.length}`);
console.log(`Relations: ${JSON.stringify(relationCount)}`);

if (issues.length > 0) {
  console.log("Issues handled:");
  for (const issue of issues) {
    console.log(`- ${issue}`);
  }
}
