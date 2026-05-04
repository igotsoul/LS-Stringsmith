# LS Stringsmith

## Decision Log

Last updated: 2026-05-04

This log captures meaningful product, UX, and architecture decisions that should survive chat history compression. Keep entries short and decision-oriented.

---

## 2026-04-29

### DL-001: Move from exploratory chat mode to structured delivery

Status: accepted

Decision:

- stop treating one long chat as the primary coordination artifact
- use dedicated delivery threads per major slice
- keep `v1-baseline.md`, `decision-log.md`, and `implementation-backlog.md` as the control layer

Why:

- current repo state is already substantial
- context compression and many UI loops make traceability weaker
- the product now benefits more from explicit slice control than open-ended iteration

Consequence:

- future work should be organized as discrete slices with clear goals and acceptance criteria

### DL-002: Browser-first, self-contained architecture

Status: accepted

Decision:

- keep the app browser-first and self-host friendly
- avoid multi-service complexity as a V1 requirement

Why:

- low setup friction is part of the product promise
- the app should work like a lightweight web studio rather than an enterprise deployment puzzle

Consequence:

- local-first modes remain important
- server-backed features must still fit self-contained deployment

### DL-003: SQLite as the default persisted store

Status: accepted

Decision:

- use SQLite as the default server-backed persistence layer

Why:

- fits the self-contained deployment goal
- simpler than a mandatory external database
- sufficient for current single-user and draft-oriented flows

Consequence:

- persisted mode is viable without extra infrastructure
- future PostgreSQL migration remains possible but is not required for V1

### DL-004: Auth identity and project ownership are separate concepts

Status: accepted

Decision:

- keep sign-in state separate from `ownerEmail` / project claim state

Why:

- clarifies the mental model
- avoids coupling project data too tightly to session state
- supports guest-to-account and claimed/unclaimed states more cleanly

Consequence:

- UI must show auth status and ownership status distinctly

### DL-005: AI is optional and behind a provider seam

Status: accepted

Decision:

- keep AI functionality optional
- route review behavior through a provider abstraction

Why:

- product must remain usable without AI
- allows later swapping from heuristic/local review to real provider-backed review

Consequence:

- no core builder flow may depend on AI availability

### DL-006: Preview shows workshop review only

Status: accepted

Decision:

- show workshop-level review in Preview
- do not show section-level review there

Why:

- section review in the manual preview was too noisy and distracting

Consequence:

- section review remains a builder-time aid
- preview stays closer to a clean facilitation run sheet

### DL-007: Builder interaction should favor progressive disclosure

Status: accepted

Decision:

- reduce always-visible UI chrome
- keep richer detail in inspector, review panels, or contextual states

Why:

- the three-pane builder became visually overloaded too easily

Consequence:

- less always-on chip clutter
- accordions and contextual detail are preferred over permanent chrome

### DL-008: Import must be reviewed before it overwrites a draft

Status: accepted

Decision:

- importing a project bundle should first show compatibility and metadata review

Why:

- blind file import is too opaque once multiple runtimes and schema evolution exist

Consequence:

- bundle import is a two-step flow: inspect, then confirm

---

### DL-009: Project identity is route-backed and storage-mode local

Status: accepted

Decision:

- project routes use real project ids at `/project/[projectId]/setup`, `/builder`, and `/preview`
- each storage mode owns its own persisted project list
- importing can replace a selected project or create a separate project in the current storage mode

Why:

- the product needs real multi-project handling without introducing account or collaboration semantics before the auth slice

Consequence:

- `demo` remains only as the initial seed project identity for empty stores and backward-compatible links
- project CRUD is implemented at the storage-adapter level for guest local, workspace draft, and server draft modes

---

### DL-010: Magic-link auth uses delivery providers, not OAuth

Status: accepted

Decision:

- keep V1 auth on the existing magic-link model
- route magic-link requests through an auth provider seam and a mail delivery provider seam
- support `demo` delivery for local/self-host development and an `http` delivery hook for real mail providers

Why:

- satisfies the hosted auth delivery slice without adding OAuth, roles, organizations, or collaboration semantics
- keeps the app self-host friendly and dependency-light
- lets deployments connect mail through an existing provider relay or serverless endpoint

Consequence:

- demo mode remains visibly local and returns an openable activation link
- real delivery mode sends the link server-side and does not expose the activation URL in the UI
- specific vendor adapters can be added later behind the same mail provider interface

### DL-011: Vendor-specific mail delivery is deferred until real hosting requires it

Status: accepted

Decision:

- keep the current mail delivery seam generic
- do not add a direct Resend or other vendor adapter yet

Why:

- the current product stage only needs a working auth seam and self-host-friendly hook
- adding a concrete vendor now would increase setup and maintenance without improving the core workshop-design value

Consequence:

- `demo` and `http` delivery modes remain the current implementation baseline
- direct provider integrations are future hardening work, not a blocker for AI integration

### DL-012: Groq is the first real review AI provider

Status: accepted

Decision:

- use Groq as the first provider behind the review provider seam
- treat Groq as an OpenAI-compatible Chat Completions endpoint
- default to `openai/gpt-oss-20b`
- require structured JSON schema responses for block, section, workshop, and invitation refinement outputs
- keep the existing heuristic review as the local fallback

Why:

- Groq satisfies the immediate need for a real provider-backed review path without adding a second AI abstraction too early
- the OpenAI-compatible HTTP shape keeps the integration dependency-light
- structured JSON keeps the existing review UI stable and parseable

Consequence:

- `GROQ_API_KEY` stays server-side only
- `LSD_AI_PROVIDER=off` disables provider calls while preserving local fallback behavior
- later providers can be added behind the same server-side orchestration route without changing the review cards first

### DL-013: Invitation refinement is a coaching interaction, not an automatic rewrite

Status: accepted

Decision:

- keep AI invitation refinement behind an explicit user action
- show the suggested prompt in a confirmation popup instead of applying it immediately
- support refinement for the main invitation and editable sub-prompts
- return coaching feedback that compares the user's wording with the suggested wording
- allow AI to say `needsChange=false` when the current invitation is already strong

Why:

- facilitators should learn how to formulate better invitations while using the tool
- endless micro-polishing erodes trust and wastes provider calls
- accept / decline preserves user ownership of the workshop language

Consequence:

- the refinement schema includes `needsChange`, `text`, `rationale`, and `learningPoints`
- when no meaningful change is needed, the UI shows a positive "already strong" state with no accept action
- refinement feedback should reference concrete wording from the original prompt instead of generic checklist summaries

### DL-014: AI fit reviews should not fire on every keystroke

Status: accepted

Decision:

- do not call the AI review endpoint continuously while the user edits invitation text
- update local/fallback review state while typing
- trigger AI fit review from a committed prompt snapshot, such as blur or an explicit review/open action

Why:

- live provider calls during typing create unnecessary throttling risk
- partial prompts are noisy review input
- the facilitator should be able to finish a thought before AI judges fit

Consequence:

- block, section, and workshop review requests use stable snapshots rather than every transient edit
- accepted AI refinements update the relevant review snapshot once
- future AI editor features should prefer explicit or committed triggers over per-keystroke calls

---

## 2026-04-30

### DL-015: Product and repository identity is LS Stringsmith

Status: accepted

Decision:

- use `LS Stringsmith` as the product name
- use `ls-stringsmith` as the package name
- use `igotsoul/LS-Stringsmith` as the GitHub repository identity

Why:

- the name keeps the Liberating Structures insider concept of "strings" while making the product feel more crafted and memorable
- the old working name described the category but did not give the project a strong identity

Consequence:

- app chrome, README, package metadata, bundle labels, mail labels, docs, and print stamps should use `LS Stringsmith`
- the old working name should not be reintroduced except in historical notes

### DL-016: Source code is MIT, LS assets stay third-party

Status: accepted

Decision:

- license the LS Stringsmith source code under MIT
- keep third-party Liberating Structures assets and materials under their original licenses
- document the boundary in `THIRD_PARTY_NOTICES.md` and `public/icons/official/README.md`

Why:

- MIT keeps the app code easy to inspect, fork, self-host, and extend
- the official LS icons and related materials come from outside the project and should not be implied to be part of the MIT grant
- Creative Commons licenses are appropriate for those assets/content, but not for the application source code itself

Consequence:

- `LICENSE` covers the project source code
- `THIRD_PARTY_NOTICES.md` must be kept current when third-party LS assets or content are added, removed, or replaced
- product docs must avoid implying that code and third-party assets are covered by the same license grant

### DL-017: Current visual alpha baseline is cool-neutral and themeable

Status: accepted

Decision:

- keep the current alpha UI on cool neutral surfaces with Teal/Navy structure accents
- use the Inter-based system font stack currently in `app/globals.css`
- keep the optional light/dark theme toggle as part of the alpha shell
- treat earlier warm editorial font and palette notes as direction context, not as binding implementation until a deliberate visual pass reopens them

Why:

- the current implementation is coherent, readable, and already wired across the main app shell
- changing typography and palette now would be a visual redesign rather than a documentation fix

Consequence:

- future design work should either refine the current cool-neutral baseline or intentionally replace it in one named visual pass
- docs should distinguish implemented visual baseline from earlier exploratory recommendations

---

## 2026-05-04

### DL-018: Alpha builder closure uses direct controls over larger management dialogs

Status: accepted

Decision:

- replace the Builder export placeholder with a compact export menu
- download Markdown manuals and project bundles directly from Builder
- keep print/PDF generation routed through Manual Preview and browser print
- persist preparation notes at section level and facilitator notes at block-instance level
- keep day handling simple for alpha: add a day, rename a day label, and move sections into an existing day lane
- defer complex day merge, day reorder, collapse, and export preset dialogs

Why:

- the alpha needs the core facilitation workflow to be complete without introducing modal-heavy management surfaces
- facilitators need private preparation notes to survive save/export, not only library guidance text
- day groups should be useful for real workshop planning while staying visually secondary to sections and strings

Consequence:

- the project model now carries `section.notes` and `block.facilitatorNotes`
- Preview and Markdown export include these notes when they are present and notes are enabled
- advanced export configuration and richer day management remain later-scope hardening work

---

## Open Decision Candidates

These are not decisions yet, but likely upcoming items for the log:

- AI review observability and provider failure telemetry
