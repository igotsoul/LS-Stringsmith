import { mkdir, readFile, writeFile } from "node:fs/promises";

const outputDir = new URL("../docs/llm-prompts/", import.meta.url);
const lsLibraryUrl = new URL("../domain/workshop/ls-library.ts", import.meta.url);

const neutralEntries = [
  {
    entryId: "intro",
    title: "Intro / Context",
    shortDescription: "A short, warm opening creates enough safety before deeper conversation begins.",
    libraryDuration: "8 min",
    libraryGroupSize: "Whole group",
    libraryCategoryLabel: "Opening",
    matchmakerCategory: "neutral",
  },
  {
    entryId: "input",
    title: "Input block",
    shortDescription: "Use a short framing impulse before the next structure opens up.",
    libraryDuration: "10 min",
    libraryGroupSize: "Whole group",
    libraryCategoryLabel: "Input",
    matchmakerCategory: "neutral",
  },
  {
    entryId: "reflection",
    title: "Reflection",
    shortDescription: "A gentle way to crystallize patterns before moving to the next module.",
    libraryDuration: "8 min",
    libraryGroupSize: "Solo / group",
    libraryCategoryLabel: "Reflection",
    matchmakerCategory: "neutral",
  },
];

const batches = [
  {
    fileName: "ls-profiles-batch-2-prompt.md",
    outputFileName: "ls-profiles-batch-2-output.json",
    title: "Batch 2: activation, reflection, divergence",
    ids: [
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
    ],
  },
  {
    fileName: "ls-profiles-batch-3-prompt.md",
    outputFileName: "ls-profiles-batch-3-output.json",
    title: "Batch 3: analysis, patterns, systems",
    ids: [
      "agreement-and-certainty-matrix",
      "ecocycle-planning",
      "panarchy",
      "generative-relationships-star",
      "network-patterning-cards",
      "simple-ethnography",
      "min-specs",
      "integrated-autonomy",
    ],
  },
  {
    fileName: "ls-profiles-batch-4-prompt.md",
    outputFileName: "ls-profiles-batch-4-output.json",
    title: "Batch 4: help, relationships, support",
    ids: [
      "troika-consulting",
      "wise-crowds",
      "wise-crowds-fur-grosse-gruppen",
      "helping-heuristics",
      "heard-seen-respected",
      "grief-walking",
      "social-network-webbing",
      "discovery-and-action-dialogue-dad",
      "talking-with-pixies",
    ],
  },
  {
    fileName: "ls-profiles-batch-5-prompt.md",
    outputFileName: "ls-profiles-batch-5-output.json",
    title: "Batch 5: sharing, strategy, planning, large formats",
    ids: [
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
    ],
  },
];

function unescapeString(value) {
  return JSON.parse(`"${value}"`);
}

async function readOfficialEntries() {
  const source = await readFile(lsLibraryUrl, "utf8");
  const officialEntries = [];
  const entryPattern =
    /\{\s*id: "([^"]+)",\s*title: "([^"]+)",\s*icon: "([^"]+)",\s*shortDescription: "((?:[^"\\]|\\.)*)",\s*libraryDuration: "((?:[^"\\]|\\.)*)",\s*libraryGroupSize: "((?:[^"\\]|\\.)*)",\s*libraryCategoryLabel: "((?:[^"\\]|\\.)*)",\s*matchmakerCategory: "([^"]+)",\s*sourceStatus: "([^"]+)"/g;

  for (const match of source.matchAll(entryPattern)) {
    officialEntries.push({
      entryId: match[1],
      title: match[2],
      shortDescription: unescapeString(match[4]),
      libraryDuration: unescapeString(match[5]),
      libraryGroupSize: unescapeString(match[6]),
      libraryCategoryLabel: unescapeString(match[7]),
      matchmakerCategory: match[8],
    });
  }

  return officialEntries;
}

function makePrompt({ allEntries, batch }) {
  const entriesById = new Map(allEntries.map((entry) => [entry.entryId, entry]));
  const entriesToProfile = batch.ids.map((entryId) => {
    const entry = entriesById.get(entryId);

    if (!entry) {
      throw new Error(`Missing batch entry ${entryId}`);
    }

    return entry;
  });
  const payload = {
    outputFileName: batch.outputFileName,
    allowedEntryIds: allEntries.map((entry) => entry.entryId),
    referenceEntries: allEntries,
    entriesToProfile,
  };

  return `# LS Recommendation Profile Enrichment: ${batch.title}

You are receiving this file as an executable prompt. Follow the instructions below and create the requested downloadable JSON file.

## Output Requirement

Create a downloadable file named \`${batch.outputFileName}\`.

The downloadable file must contain valid JSON only, using this exact top-level shape:

\`\`\`json
{
  "profiles": []
}
\`\`\`

If your interface cannot create downloadable files, return the raw JSON only without Markdown fences, comments, or explanatory text.

## Task

You are helping create static recommendation metadata for a Liberating Structures workshop design app.

The app will not call AI at runtime for these recommendations. Your output will be reviewed and converted into deterministic product data.

For every entry in \`entriesToProfile\`, return exactly one recommendation profile using the required JSON shape.

## Product Meaning

- \`Pairs well with\` means a structure complements the current structure before or after it in a workshop flow.
- \`Use instead\` means a structure can replace the current structure for a similar workshop need, with a clear tradeoff.
- Recommendations should support workshop design decisions, not just list vaguely related structures.

## Important Lessons From Prior Review

- Do not recommend very large structures such as \`purpose-to-practice-p2p\`, \`open-space-technology\`, \`design-storyboards-advanced\`, or \`critical-uncertainties\` as casual direct pairings. They are major workshop formats and should only appear when the reason is very strong.
- Risky, vulnerable, personal, or emotionally sharp structures must have realistic \`trustRequirement\` and \`riskLevel\`.
- \`Use instead\` must be a true substitute for a similar job, not merely an adjacent follow-up.
- Prefer fewer, higher-quality recommendations over filling every array.
- Keep neutral support blocks such as \`intro\`, \`input\`, and \`reflection\` available as pairings when they genuinely help the flow.

## Rules

- Output JSON only in the downloadable file.
- Include exactly one profile per entry in \`entriesToProfile\`.
- Use only entry IDs from \`allowedEntryIds\` for pairings and substitutes.
- Use \`referenceEntries\` to choose pairings and substitutes, but do not create profiles for entries outside \`entriesToProfile\`.
- Never reference the same entry as its own pairing or substitute.
- Use only the controlled vocabulary values listed below.
- If uncertain, prefer fewer recommendations with lower confidence over invented certainty.
- \`pairsWellAfter\` means: structures that work well immediately before the current structure.
- \`pairsWellBefore\` means: structures that work well immediately after the current structure.
- \`useInstead\` means: structures that can replace the current structure for a similar workshop need, with a clear tradeoff.
- Keep each \`reason\` under 160 characters.
- Keep \`bestWhen\` and \`avoidWhen\` practical and facilitation-oriented.
- Prefer official Liberating Structures knowledge when you know it, but do not invent specific claims when the supplied data is too thin.

## Controlled Vocabularies

purposeTags:
safety, connection, inclusion, divergence, idea-generation, sensemaking, pattern-detection, reflection, debrief, decision, prioritization, commitment, action-planning, strategy, systems-thinking, help, knowledge-sharing, relationship-mapping, conflict-surfacing, constraints, experimentation, innovation, purpose-clarity

sequenceRoles:
opener, warm-up, discover, diverge, deepen, analyze, synthesize, decide, plan, commit, close, bridge, expert-input

outputTypes:
shared-context, questions, stories, ideas, options, patterns, insights, priorities, decisions, requests, agreements, actions, prototypes, principles, maps, constraints

inputNeeds:
clear-purpose, challenge-question, personal-experience, existing-data, stakeholder-roles, prior-output, examples, problem-list, options-list, decision-context, high-trust, physical-space, expertise, none

energyLevel, trustRequirement, facilitationComplexity:
low, medium, high

riskLevel:
gentle, moderate, sharp

formatFit:
onsite, remote, hybrid

substitute tradeoffs:
shorter, safer, deeper, broader-participation, more-structured, more-energetic, more-reflective, more-action-oriented, better-for-large-groups, better-for-low-trust

confidence:
low, medium, high

## Required Profile Shape

\`\`\`json
{
  "entryId": "string",
  "purposeTags": ["controlled-value"],
  "sequenceRoles": ["controlled-value"],
  "outputTypes": ["controlled-value"],
  "inputNeeds": ["controlled-value"],
  "energyLevel": "low|medium|high",
  "trustRequirement": "low|medium|high",
  "riskLevel": "gentle|moderate|sharp",
  "facilitationComplexity": "low|medium|high",
  "formatFit": ["onsite|remote|hybrid"],
  "bestWhen": ["short practical sentence"],
  "avoidWhen": ["short practical sentence"],
  "pairsWellAfter": [
    {
      "entryId": "allowed entry id",
      "reason": "under 160 chars",
      "confidence": "low|medium|high"
    }
  ],
  "pairsWellBefore": [
    {
      "entryId": "allowed entry id",
      "reason": "under 160 chars",
      "confidence": "low|medium|high"
    }
  ],
  "useInstead": [
    {
      "entryId": "allowed entry id",
      "tradeoff": "controlled tradeoff",
      "reason": "under 160 chars",
      "confidence": "low|medium|high"
    }
  ],
  "notes": "one concise implementation note",
  "sourceConfidence": "low|medium|high"
}
\`\`\`

## Input Data

\`\`\`json
${JSON.stringify(payload, null, 2)}
\`\`\`
`;
}

const officialEntries = await readOfficialEntries();
const allEntries = [...neutralEntries, ...officialEntries];
const uniqueIds = new Set(allEntries.map((entry) => entry.entryId));

if (uniqueIds.size !== allEntries.length) {
  throw new Error("Duplicate entry IDs found while generating prompts.");
}

await mkdir(outputDir, { recursive: true });

for (const batch of batches) {
  const prompt = makePrompt({ allEntries, batch });
  const outputUrl = new URL(batch.fileName, outputDir);
  await writeFile(outputUrl, prompt);
  console.log(outputUrl.pathname);
}
