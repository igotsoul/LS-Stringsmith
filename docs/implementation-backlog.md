# Liberating Structure Designer

## Implementation Backlog

Last updated: 2026-04-29

This backlog turns the current repo state into the next structured delivery plan. It is intentionally slice-based instead of issue-exhaustive.

## 1. Backlog Rules

- each slice should be small enough to verify with `build` and `typecheck`
- each slice should update the baseline / decision log if it changes product or architecture
- each slice should have explicit `In Scope`, `Out of Scope`, and `Acceptance Criteria`
- avoid mixing multiple large concerns in one implementation thread

## 2. Current Baseline

Already completed:

- app scaffold
- builder shell
- local persistence
- server draft persistence with SQLite
- provider-ready magic-link auth and mail delivery seam
- bundle metadata + reviewed import flow
- heuristic review provider abstraction
- Groq-backed AI review provider integration with local fallback
- preview / export baseline
- persisted multi-project management

## 3. Priority Slices

### Slice A: Persisted Project Management

Priority: P1

Status: Completed in current implementation.

Goal:

- replace the current demo-centered project handling with real multi-project management

In Scope:

- multiple persisted projects
- create / rename / duplicate / delete project flows
- project list backed by real stored records
- import target selection or creation logic
- route model that is no longer artificially tied to one demo project

Out of Scope:

- collaboration
- AI
- OAuth

Acceptance Criteria:

- Done: user can create more than one project
- Done: projects appear as real data in the Projects screen
- Done: a project can be renamed, duplicated, and deleted
- Done: persisted modes support more than one project cleanly
- Done: typecheck passes; build must remain part of release verification

Recommended thread start prompt:

```text
Arbeite nur am Slice "Persisted Project Management".

Ziel:
- mehrere echte Projekte statt nur eines Demo-Projekts unterstützen
- Project list, create, rename, duplicate, delete implementieren
- guest local / workspace draft / server draft über mehrere Projekte konsistent machen
- Import-Flow auf ein echtes Zielprojekt oder neues Projekt ausrichten

In Scope:
- Datenmodell, Store, Storage-Adapter, Projects-Screen, Routing
- notwendige Doku-Updates in v1 baseline, decision log und backlog

Out of Scope:
- AI
- Mailversand
- Kollaboration

Verifiziere mit build und typecheck.
```

### Slice B: Hosted Auth & Mail Delivery

Priority: P1

Status: Substantially done in current implementation. Vendor-specific mail adapters are deferred.

Goal:

- turn the current local magic-link seam into a real delivery-capable auth path

In Scope:

- Done: mail delivery abstraction
- Done: configurable delivery provider hooks
- Done: auth success / failure / expired link states
- Done: self-host friendly configuration
- Done: clearer distinction between local demo-like activation and real delivery

Out of Scope:

- OAuth
- org/workspace permissions
- collaboration

Acceptance Criteria:

- Done: magic-link request flow can be wired to a real delivery provider through the HTTP mail hook
- Done: failure and expiry states are handled in UI
- Done: self-host configuration path is documented in the runtime notes below
- Done: claim flow still works on top of the hardened auth seam
- Done: typecheck and build pass

Runtime configuration:

- `LSD_AUTH_PROVIDER=magic-link` keeps the V1 auth provider explicit.
- `LSD_MAIL_PROVIDER=demo` is the default local/self-host demo seam and returns an openable link in the UI.
- `LSD_MAIL_PROVIDER=http` sends the activation URL to `LSD_MAIL_HTTP_ENDPOINT` as a JSON payload for a real delivery relay.
- `LSD_MAIL_HTTP_BEARER_TOKEN` optionally adds bearer auth to the HTTP hook.
- `LSD_MAIL_FROM` and `LSD_MAIL_PROVIDER_LABEL` customize delivery metadata.
- `LSD_AUTH_BASE_URL` sets the public origin used inside emailed links.
- `LSD_AUTH_MAGIC_LINK_TTL_MINUTES`, `LSD_AUTH_SESSION_TTL_DAYS`, and `LSD_AUTH_COOKIE_SECURE` tune token, session, and cookie behavior.

Deferred for later:

- direct vendor adapters such as Resend or other first-party mail SDK integrations

Recommended thread start prompt:

```text
Arbeite nur am Slice "Hosted Auth & Mail Delivery".

Ziel:
- den bestehenden lokalen Magic-Link-Flow auf eine echte providerfähige Mail-Seam umstellen
- klare Konfiguration für self-hosting vorsehen
- Session-Handling und Claim-Flow robust machen

In Scope:
- auth provider abstraction
- mail delivery hooks
- env/config handling
- UX für request link / success / failure / expired link

Out of Scope:
- OAuth
- Multi-user collaboration
- AI

Verifiziere mit build und typecheck.
```

### Slice C: AI Provider Integration

Priority: P2

Status: Completed in current implementation.

Goal:

- replace heuristic review behavior with a real provider-backed implementation while keeping the existing UI stable

In Scope:

- Done: provider wiring behind the existing review abstraction
- Done: server-side orchestration through `/api/ai-review`
- Done: Groq as the first provider via OpenAI-compatible Chat Completions
- Done: default model `openai/gpt-oss-20b`
- Done: structured JSON schema responses for block, section, workshop, and invitation refinement outputs
- Done: config and privacy handling without exposing API keys to the client
- Done: graceful fallback when AI is off, unavailable, times out, or returns invalid JSON
- Done: invitation refinement uses an accept / decline popup instead of immediate overwrite
- Done: invitation refinement supports main invitations and editable sub-prompts
- Done: invitation refinement gives coaching feedback with `rationale` and `learningPoints`
- Done: invitation refinement can return `needsChange=false` when the prompt is already strong
- Done: AI fit review calls are snapshot-triggered rather than fired on every invitation keystroke

Out of Scope:

- autonomous workshop generation
- new large builder flows

Acceptance Criteria:

- Done: block, section, and workshop reviews still work through the same UI
- Done: AI remains optional
- Done: failures degrade gracefully to local heuristic review
- Done: invitation improvements preserve user choice through accept / decline
- Done: repeated sharpening can stop with an "already strong" state
- Done: editing invitations does not continuously call the AI provider
- Done: typecheck passes
- Done: build passes

Runtime configuration:

- `GROQ_API_KEY` enables Groq calls server-side when a Groq provider is selected or when no explicit provider is set.
- `LSD_AI_PROVIDER=groq` explicitly selects Groq.
- `LSD_AI_PROVIDER=off` disables provider calls and keeps local fallback behavior.
- `LSD_AI_MODEL` overrides the default `openai/gpt-oss-20b` model.
- `LSD_AI_TIMEOUT_MS` controls the server-side provider timeout.
- `GROQ_BASE_URL` can override the OpenAI-compatible Groq base URL for compatible deployments.

Recommended thread start prompt:

```text
Arbeite nur am Slice "AI Provider Integration".

Ziel:
- die bestehende ReviewProvider-Abstraktion mit einem echten AI-Backend verbinden
- Workshop-, Section- und Block-Reviews weiter über dieselbe UI ausliefern
- AI optional und abschaltbar halten

In Scope:
- provider wiring
- server-side orchestration
- config/env handling
- graceful fallback
- decision log und backlog aktualisieren, falls Architekturentscheidungen entstehen

Out of Scope:
- autonome Workshop-Generierung
- neue große UI-Flows

Verifiziere mit build und typecheck.
```

### Slice D: Hardening & Release Readiness

Priority: P2

Goal:

- make the app stable enough for a credible internal alpha

In Scope:

- test coverage for core domain and storage seams
- smoke tests / checklists for key flows
- empty / error / loading states
- self-host documentation
- release checklist

Out of Scope:

- new major features

Acceptance Criteria:

- core storage and bundle flows have automated coverage
- key user-facing error states are explicit
- self-host path is documented
- build and typecheck pass

Recommended thread start prompt:

```text
Arbeite nur am Slice "Hardening & Release Readiness".

Ziel:
- die App für einen stabilen internen Alpha-Stand absichern
- kritische Flows testen und Fehlersituationen abdecken
- self-hosting und lokale Nutzung dokumentieren

In Scope:
- test coverage für Kernlogik
- smoke tests für zentrale Flows
- error/empty/loading states
- self-host docs
- release checklist

Out of Scope:
- neue große Features

Verifiziere mit build, typecheck und einer klaren Testübersicht.
```

## 4. Later / Not Now

Not part of the next slices unless explicitly re-prioritized:

- collaboration
- template marketplace
- richer LS corpus ingestion
- analytics
- mobile-first authoring
- advanced permissioning

## 5. Suggested Thread Order

Use the next implementation chats in this order:

1. `Hardening & Release Readiness`

Use a lightweight stewardship thread in parallel only for:

- baseline updates
- decision log updates
- backlog reprioritization
