# LS Recommendation Profile Enrichment

This document defines the static metadata we need to power no-AI recommendations for
`Pairs well with` and `Use instead`.

The app should not require AI at runtime for these recommendations. LLMs may be used
offline to draft this metadata, but the product should consume reviewed static data.

## Goal

For each Liberating Structure, create a recommendation profile that lets the app
answer two questions deterministically:

- `Pairs well with`: Which structures complement this one before or after it in a workshop flow?
- `Use instead`: Which structures can substitute for this one, and what tradeoff does the user get?

The recommendation engine should later combine these profiles with workshop context:

- workshop purpose
- section subgoal
- selected structure
- position in the section
- previous and next blocks
- section duration and remaining time
- format, group size, energy, trust, and conflict context when available

## Controlled Vocabularies

Use only these values unless the schema is intentionally updated.

### purposeTags

- `safety`
- `connection`
- `inclusion`
- `divergence`
- `idea-generation`
- `sensemaking`
- `pattern-detection`
- `reflection`
- `debrief`
- `decision`
- `prioritization`
- `commitment`
- `action-planning`
- `strategy`
- `systems-thinking`
- `help`
- `knowledge-sharing`
- `relationship-mapping`
- `conflict-surfacing`
- `constraints`
- `experimentation`
- `innovation`
- `purpose-clarity`

### sequenceRoles

- `opener`
- `warm-up`
- `discover`
- `diverge`
- `deepen`
- `analyze`
- `synthesize`
- `decide`
- `plan`
- `commit`
- `close`
- `bridge`
- `expert-input`

### outputTypes

- `shared-context`
- `questions`
- `stories`
- `ideas`
- `options`
- `patterns`
- `insights`
- `priorities`
- `decisions`
- `requests`
- `agreements`
- `actions`
- `prototypes`
- `principles`
- `maps`
- `constraints`

### inputNeeds

- `clear-purpose`
- `challenge-question`
- `personal-experience`
- `existing-data`
- `stakeholder-roles`
- `prior-output`
- `examples`
- `problem-list`
- `options-list`
- `decision-context`
- `high-trust`
- `physical-space`
- `expertise`
- `none`

### qualitative scales

`energyLevel`, `trustRequirement`, and `facilitationComplexity`:

- `low`
- `medium`
- `high`

`riskLevel`:

- `gentle`
- `moderate`
- `sharp`

`formatFit`:

- `onsite`
- `remote`
- `hybrid`

### substitute tradeoffs

- `shorter`
- `safer`
- `deeper`
- `broader-participation`
- `more-structured`
- `more-energetic`
- `more-reflective`
- `more-action-oriented`
- `better-for-large-groups`
- `better-for-low-trust`

### confidence

- `low`
- `medium`
- `high`

## Canonical JSON Shape

```json
{
  "profiles": [
    {
      "entryId": "124all",
      "purposeTags": ["inclusion", "divergence", "idea-generation"],
      "sequenceRoles": ["discover", "diverge"],
      "outputTypes": ["ideas", "patterns"],
      "inputNeeds": ["challenge-question"],
      "energyLevel": "medium",
      "trustRequirement": "low",
      "riskLevel": "gentle",
      "facilitationComplexity": "low",
      "formatFit": ["onsite", "remote", "hybrid"],
      "bestWhen": [
        "The facilitator needs broad participation quickly.",
        "The group needs to move from individual thinking to shared patterns."
      ],
      "avoidWhen": [
        "The topic requires deep personal disclosure before safety has been built."
      ],
      "pairsWellAfter": [
        {
          "entryId": "intro",
          "reason": "A short framing block can make the invitation clearer and safer.",
          "confidence": "medium"
        }
      ],
      "pairsWellBefore": [
        {
          "entryId": "what-so-what-now-what",
          "reason": "The generated ideas can be debriefed and converted into next steps.",
          "confidence": "medium"
        }
      ],
      "useInstead": [
        {
          "entryId": "impromptu-networking",
          "tradeoff": "more-energetic",
          "reason": "Use when connection and fast exchange matter more than synthesis.",
          "confidence": "medium"
        }
      ],
      "notes": "Works as a reliable participation ramp with low facilitation risk.",
      "sourceConfidence": "medium"
    }
  ]
}
```

## Offline LLM Enrichment Prompt

Use this prompt with another LLM to generate draft metadata. Batch 8-12 structures
at a time for better attention and easier review.

```text
You are helping create static recommendation metadata for a Liberating Structures workshop design app.

The app will NOT call AI at runtime for these recommendations. Your output will be reviewed and converted into deterministic product data.

Task:
For every provided structure, return one recommendation profile using the exact JSON shape below.

Rules:
- Return JSON only. No Markdown, no prose outside JSON.
- Include exactly one profile per provided entry.
- Use only entry IDs from the provided allowedEntryIds list for pairings and substitutes.
- The allowed IDs include official LS entries and neutral support blocks; do not include transition entries.
- Never reference the same entry as its own pairing or substitute.
- Use only the controlled vocabulary values listed below.
- If uncertain, prefer fewer recommendations with lower confidence over invented certainty.
- `pairsWellAfter` means: structures that work well immediately before the current structure.
- `pairsWellBefore` means: structures that work well immediately after the current structure.
- `useInstead` means: structures that can replace the current structure for a similar workshop need, with a clear tradeoff.
- Keep each `reason` under 160 characters.
- Keep `bestWhen` and `avoidWhen` practical and facilitation-oriented.
- Prefer official Liberating Structures knowledge when you know it, but do not invent specific claims when the supplied data is too thin.

Controlled vocabularies:

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

Required JSON output shape:
{
  "profiles": [
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
  ]
}

Input:
{
  "allowedEntryIds": [
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
    "xxn-writing"
  ],
  "entriesToProfile": [
    {
      "entryId": "replace-me",
      "title": "replace-me",
      "shortDescription": "replace-me",
      "libraryDuration": "replace-me",
      "libraryGroupSize": "replace-me",
      "libraryCategoryLabel": "replace-me",
      "matchmakerCategory": "replace-me"
    }
  ]
}
```

## Suggested Batch 1

Start with the structures already used in the demo flow. This lets us test whether
the recommendations feel useful before profiling the full library.

```json
{
  "allowedEntryIds": [
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
    "xxn-writing"
  ],
  "entriesToProfile": [
    {
      "entryId": "intro",
      "title": "Intro / Context",
      "shortDescription": "A short, warm opening creates enough safety before deeper conversation begins.",
      "libraryDuration": "8 min",
      "libraryGroupSize": "Whole group",
      "libraryCategoryLabel": "Opening",
      "matchmakerCategory": "neutral"
    },
    {
      "entryId": "input",
      "title": "Input block",
      "shortDescription": "Use a short framing impulse before the next structure opens up.",
      "libraryDuration": "10 min",
      "libraryGroupSize": "Whole group",
      "libraryCategoryLabel": "Input",
      "matchmakerCategory": "neutral"
    },
    {
      "entryId": "reflection",
      "title": "Reflection",
      "shortDescription": "A gentle way to crystallize patterns before moving to the next module.",
      "libraryDuration": "8 min",
      "libraryGroupSize": "Solo / group",
      "libraryCategoryLabel": "Reflection",
      "matchmakerCategory": "neutral"
    },
    {
      "entryId": "124all",
      "title": "1-2-4-All",
      "shortDescription": "Engage Everyone Simultaneously in Generating Questions, Ideas, and Suggestions",
      "libraryDuration": "12 min",
      "libraryGroupSize": "Group",
      "libraryCategoryLabel": "Reveal",
      "matchmakerCategory": "reveal"
    },
    {
      "entryId": "appreciative",
      "title": "Appreciative Interviews",
      "shortDescription": "Discovering and Building on the Root Causes of Success",
      "libraryDuration": "1 hr",
      "libraryGroupSize": "Solo / group",
      "libraryCategoryLabel": "Reveal / Share / Solo",
      "matchmakerCategory": "reveal"
    },
    {
      "entryId": "triz",
      "title": "TRIZ",
      "shortDescription": "Stop Counterproductive Activities and Behaviors to Make Space for Innovation",
      "libraryDuration": "35 min",
      "libraryGroupSize": "Solo / group",
      "libraryCategoryLabel": "Reveal / Solo",
      "matchmakerCategory": "reveal"
    },
    {
      "entryId": "winfy",
      "title": "What I Need From You",
      "shortDescription": "Surface Essential Needs Across Functions and Accept or Reject Requests for Support",
      "libraryDuration": "55-70 min",
      "libraryGroupSize": "Group",
      "libraryCategoryLabel": "Help",
      "matchmakerCategory": "help"
    },
    {
      "entryId": "what-so-what-now-what",
      "title": "What, So What, Now What?",
      "shortDescription": "Together, Look Back on Progress to Date and Decide What Adjustments Are Needed",
      "libraryDuration": "45 min",
      "libraryGroupSize": "Solo / group",
      "libraryCategoryLabel": "Analyze / Solo",
      "matchmakerCategory": "analyze"
    },
    {
      "entryId": "nine-whys",
      "title": "Nine Whys",
      "shortDescription": "Make the Purpose of Your Work Together Clear",
      "libraryDuration": "20 min",
      "libraryGroupSize": "Solo / group",
      "libraryCategoryLabel": "Analyze / Solo",
      "matchmakerCategory": "analyze"
    },
    {
      "entryId": "impromptu-networking",
      "title": "Impromptu Networking",
      "shortDescription": "Rapidly Share Challenges and Expectations, Build New Connections",
      "libraryDuration": "20 min",
      "libraryGroupSize": "Group",
      "libraryCategoryLabel": "Share",
      "matchmakerCategory": "share"
    },
    {
      "entryId": "conversation-cafe",
      "title": "Conversation Cafe",
      "shortDescription": "Engage Everyone in Making Sense of Profound Challenges",
      "libraryDuration": "35-60 min",
      "libraryGroupSize": "Group",
      "libraryCategoryLabel": "Share",
      "matchmakerCategory": "share"
    }
  ]
}
```

## Review Checklist

Before importing LLM output into product data:

- Every `entryId` exists in the library.
- No entry recommends itself.
- All tags are from controlled vocabularies.
- Pairing direction is correct:
  - `pairsWellAfter` means the recommended structure comes before the current one.
  - `pairsWellBefore` means the recommended structure comes after the current one.
- `Use instead` options are true substitutes, not just adjacent complements.
- Reasons are practical and short enough for UI display.
- Low-confidence relationships are either removed or kept hidden until later.
- Profiles for sharp or vulnerable structures have realistic trust/risk metadata.

## Product Use Later

The deterministic engine should treat this metadata as one signal, not the whole
answer. A later scorer can combine:

- profile tag match against section subgoal and workshop purpose
- sequence-role fit for selected position
- output-to-input continuity between neighboring blocks
- time and group constraints
- risk/trust fit
- curated pair/substitute boosts

AI can later be optional. If enabled, it should rerank or explain the deterministic
shortlist, not replace it.
