# LS Recommendation Profile Process

This note explains how we create and maintain the static metadata behind the
Builder inspector recommendations.

## Why This Exists

The inspector has two recommendation sections:

- `Pairs well with`: structures that complement the selected card before or after it.
- `Use instead`: structures that can replace the selected card with a clear tradeoff.

These recommendations must work when project AI is disabled. For that reason, the
runtime product should not depend on live AI calls. The app should use deterministic
profile data and local workshop context.

AI may still be useful offline as a drafting tool. In this workflow, LLMs help create
structured draft metadata, but reviewed static JSON is what the app consumes.

## Core Principle

Use AI for offline metadata drafting, not runtime decision making.

At runtime, recommendations are based on:

- reviewed LS recommendation profiles
- selected card
- current section
- workshop purpose and context
- position in the section flow
- curated fallback relationships

The runtime also applies lightweight context filters before showing cards:

- Entries already present in the current section are hidden from recommendations.
- `Use instead` entries are hidden when the same entry is already visible under
  `Pairs well with`.

This keeps the feature available without AI, easier to debug, and more transparent
for facilitators.

## Artifacts

- Schema and prompt reference:
  `docs/ls-recommendation-enrichment.md`
- Executable prompt files:
  `docs/llm-prompts/`
- Raw LLM outputs:
  `docs/llm-output/`
- Runtime profile data:
  `domain/workshop/ls-recommendation-profiles.json`
- Blend and curation script:
  `scripts/blend-ls-profiles.mjs`
- Runtime recommendation logic:
  `domain/workshop/recommendations.ts`

## Process

1. Define a controlled schema.

   Profiles use controlled vocabularies for purpose tags, flow roles, output types,
   input needs, trust, risk, energy, format fit, substitute tradeoffs, and confidence.
   This prevents fuzzy free-text metadata from leaking into product logic.

2. Generate draft profiles offline.

   Prompt files in `docs/llm-prompts/` are self-contained. Each prompt includes the
   full allowed ID list, a reference catalog, the batch entries to profile, and an
   instruction to create a downloadable JSON file.

3. Validate the output.

   Outputs must parse as JSON, include exactly one profile per requested entry, use
   only allowed IDs, avoid self-references, and use only controlled vocabulary values.

4. Blend or curate where needed.

   For Batch 1, we compared Claude, Gemini, and GPT. Claude produced the best
   baseline. Gemini was clean but sparse. GPT was creative but noisier and used
   typographic quotes, so it needed normalization. The blend used Claude as the
   base, consensus as a boost, and explicit curated overrides for weak pairings.

5. Import static data into the runtime.

   The app reads `domain/workshop/ls-recommendation-profiles.json`. Live AI is not
   required for `Pairs well with` or `Use instead`.

6. Test in the Builder.

   Pull representative structures into sections and check whether recommendations
   are useful, directional, and not too generic. Curate the profile data when a
   recommendation is technically valid but not facilitation-useful.

## Current Batch Strategy

The runtime data currently contains all planned batches: 48 profiles total, made
from 45 official Liberating Structures plus 3 neutral support blocks.

Batch 1 covered the demo-critical structures plus neutral support blocks:

- `intro`
- `input`
- `reflection`
- `124all`
- `appreciative`
- `triz`
- `winfy`
- `what-so-what-now-what`
- `nine-whys`
- `impromptu-networking`
- `conversation-cafe`

For Batch 1, three LLMs were tested. Based on that comparison, Batch 2 through
Batch 5 were generated with Claude only. This reduced merge complexity and was
sufficient because the prompt had been tightened with the lessons learned.

If Claude-only quality drops for a batch, we can request Gemini or GPT as a targeted
second opinion for that batch rather than running every batch through every model.

## Imported Batches

Batch 2: activation, reflection, divergence

- `15percent-solutions`
- `25-10-crowd-sourcing`
- `mad-tea-party`
- `spiral-journal`
- `xxn-writing`
- `drawing-together`
- `folding-spectogram`
- `wicked-questions`
- `tiny-demons`
- `anxiety-circus`

Batch 3: analysis, patterns, systems

- `agreement-and-certainty-matrix`
- `ecocycle-planning`
- `panarchy`
- `generative-relationships-star`
- `network-patterning-cards`
- `simple-ethnography`
- `min-specs`
- `integrated-autonomy`

Batch 4: help, relationships, support

- `troika-consulting`
- `wise-crowds`
- `wise-crowds-fur-grosse-gruppen`
- `helping-heuristics`
- `heard-seen-respected`
- `grief-walking`
- `social-network-webbing`
- `discovery-and-action-dialogue-dad`
- `talking-with-pixies`

Batch 5: sharing, strategy, planning, large formats

- `celebrity-interview`
- `gallery-walk`
- `shift-and-share`
- `user-experience-fishbowl`
- `open-space-technology`
- `critical-uncertainties`
- `design-storyboards`
- `design-storyboards-advanced`
- `purpose-to-practice-p2p`
- `improv-prototyping`

## Quality Rules

Use these rules when reviewing generated profiles:

- `Use instead` must be a real substitute, not just something that could happen next.
- Direction matters:
  - `pairsWellAfter` means the recommended structure comes before the current one.
  - `pairsWellBefore` means the recommended structure comes after the current one.
- Large-format structures should not appear as casual pairings.
- High-risk or personal structures need realistic trust and risk metadata.
- Neutral blocks are useful as support moves, but should not crowd out stronger LS
  recommendations by default.
- Reasons should be facilitation-ready, short, and understandable in the inspector.
- Confidence should reflect actual certainty; do not mark speculative links as high.

## Batch 1 Lessons

The first Builder test used `TRIZ`, `1-2-4-All`, and `WINFY`.

Validated as useful:

- `TRIZ` pairs well with `Nine Whys`, `Input block`, and `15% Solutions`.
- `1-2-4-All` pairs well with `Input block`, `Impromptu Networking`,
  `Nine Whys`, and `25/10 Crowd Sourcing`.
- `WINFY` pairs well with `Nine Whys`, `15% Solutions`, and `Min Specs`.

Curated after review:

- `TRIZ`: removed generic `Intro / Context` default, replaced `Tiny Demons` with
  `Wicked Questions` as a safer alternative.
- `1-2-4-All`: strengthened `Conversation Cafe` as the deeper alternative over
  `Mad Tea Party`.
- `WINFY`: removed `P2P` as a casual before-pairing and removed `STAR` as a
  substitute; strengthened `Troika Consulting` as a safer alternative.

## Import Plan For New Outputs

When new or revised Claude outputs are available:

1. Save them in `docs/llm-output/` with clear names, for example:
   - `ls-profiles-batch-N-claude.json`
   - `ls-profiles-batch-N-gemini.json`
2. Validate structure and vocabularies.
3. Extend the blend/import script if a new batch or source model is introduced.
4. Regenerate `domain/workshop/ls-recommendation-profiles.json`.
5. Run TypeScript checks.
6. Test representative cards in the Builder.
7. Add curated overrides only when the UI review reveals misleading recommendations.
