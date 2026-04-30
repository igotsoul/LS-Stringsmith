# LS Stringsmith

## V1 Baseline

Last updated: 2026-04-30

This document freezes the current V1 baseline so product, design, and implementation can move in a more structured delivery mode. It is intentionally shorter than the full product brief and should be treated as the active source of truth for:

- current product intent
- current implementation baseline
- V1 in-scope vs later-scope
- important gaps between spec and implementation
- recommended next delivery slices

## 1. Product Intent

LS Stringsmith is a browser-first, self-contained workshop design app for facilitators who already know the basics of Liberating Structures and want to:

- design workshops faster
- compose LS chains per section/sub-goal
- keep invitations and transition notes close to the flow
- generate a facilitation-ready internal manual
- get assistive review feedback without losing design ownership

The product is intentionally:

- `LS-first`, not a generic whiteboard
- `section-based`, not one giant flat chain
- `assistive`, not auto-generative
- `browser-first`, with self-hosting and low setup in mind

## 2. Current Implementation Baseline

The current app baseline already includes:

- Next.js browser app with routed screens for `Projects`, `Setup`, `Builder`, and `Preview`
- shared app shell and design language
- product identity updated to `LS Stringsmith`
- GitHub repository published as `igotsoul/LS-Stringsmith`
- MIT source-code license plus third-party notices for LS assets and content
- guest-local persistence
- workspace-local persistence
- SQLite-backed `server draft` persistence
- real multi-project project list backed by persisted records
- create / rename / duplicate / delete project flows
- dynamic project routes by project id for setup, builder, and preview
- provider-ready magic-link auth seam for `server draft`
- local demo mail delivery and HTTP delivery hook for magic links
- claim / release flow for server drafts
- workshop builder with:
  - sections
  - blocks
  - transitions
  - drag / move interaction
  - inline invitation editing
  - section duplication, removal, reordering
- LS library with:
  - search
  - official Matchmaker categories
  - locally stored official Liberating Structures icon assets
  - related / alternative structure inspection
- step-level prompts and facilitator cues per block instance
- local review provider abstraction with:
  - block review
  - section review
  - workshop review
- server-side AI review orchestration with:
  - Groq as the first provider
  - `openai/gpt-oss-20b` as the default model
  - structured JSON responses for block, section, and workshop reviews
  - heuristic/local fallback when AI is off, unavailable, or invalid
- preview / run-sheet generation
- markdown export
- print / PDF-friendly preview
- project bundle export / import
- richer bundle metadata plus reviewed import confirmation flow
- import into a selected existing project or as a newly created project
- optional light/dark shell theme toggle

Repository stewardship baseline:

- package name is `ls-stringsmith`
- code license is MIT
- third-party Liberating Structures assets are documented separately and are not relicensed by this repository
- root project docs should keep `README.md`, `LICENSE`, `THIRD_PARTY_NOTICES.md`, `decision-log.md`, and this baseline in sync when project identity or licensing changes

## 3. V1 Scope Lock

### 3.1 In Scope for V1

- browser-first desktop experience
- single-user workshop design
- guest/local and persisted draft modes
- section-based workshop structure
- linear chains only
- LS library plus neutral workshop blocks
- inline invitation authoring
- transition notes
- preview / manual generation
- markdown + printable output
- optional assistive review
- self-contained local or self-hostable runtime

### 3.2 Explicitly Out of Scope for V1

- real-time collaboration
- parallel workshop flows
- community marketplace / public template exchange
- autonomous workshop generation
- deep roles / permissions
- mobile-first authoring
- advanced analytics

## 4. Current Gaps Between Target and Implementation

These are not failures; they are the important seams to manage deliberately.

### 4.1 Product / Data Gaps

- Project management now supports multiple persisted projects; deeper account-level reopen semantics remain future auth work.
- Day grouping is conceptually defined, but not yet a first-class editable workflow in the running app.
- The LS library is still a curated seed set, not a broader production-ready catalog.

### 4.2 Auth / Delivery Gaps

- Magic-link auth now has provider seams, a clearly marked local demo delivery mode, and an HTTP mail hook for self-hosted real delivery.
- Direct first-party adapters for specific mail vendors remain intentionally deferred and are future hardening work if the HTTP hook is not enough for a deployment.
- Claiming works per active server project, but there is no full account-level project directory or permission model yet.

### 4.3 AI Gaps

- Groq-backed review is now wired through a server route and remains optional.
- The local heuristic review remains the fallback path when AI is disabled, `GROQ_API_KEY` is missing, the provider times out, or the provider returns invalid JSON.
- Additional provider adapters, provider observability, and automated coverage for AI failure cases remain later hardening work.

### 4.4 Hardening Gaps

- Core flows build and typecheck, but there is still little automated test coverage.
- Error handling and import validation are stronger than before, but not yet comprehensively hardened.

## 5. Delivery Priorities

Recommended order from here:

1. `Hardening & Release Readiness`

Reasoning:

- hardening should happen before any broader rollout

## 6. Recommended Working Threads

From this point on, do not continue all work in one giant catch-all thread. Use one thread per delivery slice.

### Thread 1: V1 Baseline & Backlog Stewardship

Purpose:

- keep baseline, decision log, and backlog current
- capture scope changes
- prevent product / code drift

Use when:

- a slice finishes
- scope changes
- a new architectural or UX decision is made

### Thread 2: Persisted Project Management

Purpose:

- completed: maintain the current real multi-project handling and only extend it when a later slice needs account-level project semantics

### Thread 3: Hosted Auth & Mail Delivery

Purpose:

- completed: maintain the provider-ready magic-link seam, local demo delivery, HTTP mail hook, and visible success / failure / expiry states

### Thread 4: AI Provider Integration

Purpose:

- completed: keep the Groq-backed review integration healthy while preserving the local fallback

### Thread 5: Hardening & Release Readiness

Purpose:

- stabilize, test, document, and prepare for a usable alpha

## 7. Working Rules From Here

- treat this file as the active V1 contract
- update `decision-log.md` when a meaningful architectural or UX decision is made
- update `implementation-backlog.md` when a slice starts, changes, or completes
- do not add major features without explicitly classifying them as `V1` or `Later`
- prefer short, dedicated delivery threads over one long implementation chat
