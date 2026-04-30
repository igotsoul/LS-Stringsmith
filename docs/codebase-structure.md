# LS Stringsmith

## Recommended Codebase Structure v0.1

This document proposes a practical repository structure for implementing the product as a browser-first, self-contained Next.js application with shared domain logic.

The main goals are:

- keep guest mode and persisted mode aligned
- separate domain logic from UI details
- keep server-only code explicit
- make future self-hosting and extension easier

## 1. High-Level Layout

```text
/
├─ app/
├─ components/
├─ features/
├─ domain/
├─ storage/
├─ scripts/
├─ server/
├─ lib/
├─ i18n/
├─ docs/
├─ public/
├─ prisma/ or db/
├─ LICENSE
├─ THIRD_PARTY_NOTICES.md
└─ package.json
```

## 2. Directory Responsibilities

### 2.1 `app/`

Purpose:

- route entry points
- page composition
- layout composition
- server actions or route handlers where appropriate

Suggested contents:

```text
app/
├─ layout.tsx
├─ page.tsx
├─ projects/
├─ project/[projectId]/
│  ├─ builder/
│  ├─ setup/
│  └─ preview/
├─ import/
└─ api/
```

Guideline:

- keep route files thin
- compose feature-level screens here, do not place business logic here

### 2.2 `components/`

Purpose:

- shared presentational UI pieces
- layout primitives
- buttons, panels, badges, dialogs, toolbars

Examples:

```text
components/
├─ ui/
├─ layout/
├─ feedback/
└─ icons/
```

Guideline:

- only generic and reusable components belong here
- builder-specific components should live in `features/builder`

### 2.3 `features/`

Purpose:

- product-specific modules grouped by functional area

Suggested structure:

```text
features/
├─ projects/
├─ setup/
├─ builder/
├─ library/
├─ review/
├─ preview/
├─ export/
└─ auth/
```

Each feature may contain:

- screen components
- feature-specific hooks
- feature-specific state helpers
- feature-specific tests
- mapping from domain models to UI

Example:

```text
features/builder/
├─ components/
├─ hooks/
├─ state/
├─ utils/
└─ builder-screen.tsx
```

### 2.4 `domain/`

Purpose:

- shared business logic
- type definitions
- validation
- calculations
- commands

Suggested structure:

```text
domain/
├─ project/
├─ section/
├─ block/
├─ transition/
├─ review/
├─ export/
└─ shared/
```

Typical contents:

- entity types
- value objects
- reducers or command handlers
- validation rules
- duration calculations
- bundle conversion logic

Guideline:

- `domain/` must not depend on React
- `domain/` should be reusable in browser and server contexts

### 2.5 `storage/`

Purpose:

- abstract persistence behind a common interface

Suggested structure:

```text
storage/
├─ types.ts
├─ adapter.ts
├─ guest-indexeddb/
├─ persisted-api/
└─ bundle/
```

Responsibilities:

- define storage adapter contract
- implement guest mode persistence via IndexedDB
- implement persisted mode access via API/server
- handle bundle import/export serialization

Key rule:

- the rest of the app should not care whether data comes from IndexedDB or server persistence

### 2.6 `server/`

Purpose:

- server-only application logic
- auth
- database access
- AI integration
- export rendering

Suggested structure:

```text
server/
├─ auth/
├─ db/
├─ projects/
├─ library/
├─ review/
├─ export/
├─ runtime/
└─ config/
```

Guideline:

- anything that requires secrets or server-only access belongs here
- no UI code in this layer

### 2.7 `lib/`

Purpose:

- low-level helpers and third-party wiring

Examples:

- date/time utilities
- logging helpers
- environment parsing
- feature flag helpers

Guideline:

- avoid putting domain logic here

### 2.8 `i18n/`

Purpose:

- application text dictionaries
- language config
- content locale helpers

Suggested structure:

```text
i18n/
├─ config.ts
├─ messages/
│  ├─ en/
│  └─ de/
└─ helpers.ts
```

### 2.9 `prisma/` or `db/`

Purpose:

- schema definition
- migrations
- seeds for LS library

Suggested contents:

```text
prisma/
├─ schema.prisma
├─ migrations/
└─ seed/
```

If Drizzle is used instead:

```text
db/
├─ schema/
├─ migrations/
└─ seed/
```

### 2.10 `public/`

Purpose:

- static assets
- icons
- logos
- optional LS visual assets if licensing allows

Current note:

- official Liberating Structures icon assets live under `public/icons/official/`
- these assets are third-party materials and are documented in `THIRD_PARTY_NOTICES.md`

### 2.11 Root stewardship files

Purpose:

- preserve project identity, licensing, and third-party attribution at repository level

Current files:

- `README.md`
- `LICENSE`
- `THIRD_PARTY_NOTICES.md`
- `package.json`

## 3. Feature Ownership Boundaries

### 3.1 Projects Feature

Owns:

- project list
- project card UI
- create/open/delete flows
- import entry points

Does not own:

- builder-specific editing

### 3.2 Setup Feature

Owns:

- global purpose editing
- initial section/day creation
- workshop metadata forms

### 3.3 Builder Feature

Owns:

- canvas
- section boxes
- block cards
- transition cards
- drag and drop
- inline editing
- selection state

### 3.4 Library Feature

Owns:

- LS search and filtering
- library cards
- definition detail rendering

### 3.5 Review Feature

Owns:

- AI review action UI
- review summaries
- alternative suggestion presentation
- provider boundary for swapping heuristic reviews with a future AI-backed implementation

### 3.6 Preview and Export Features

Owns:

- manual preview rendering
- export initiation
- warning summary display

## 4. Shared Domain Contracts

These contracts should be defined early and reused across the app:

- `WorkshopProject`
- `WorkshopSection`
- `BlockDefinition`
- `BlockInstance`
- `Transition`
- `AIReview`
- `ReviewProvider`
- `ProjectBundle`
- `ManualDTO`
- `StorageAdapter`

These are the important seams that keep the system coherent.

## 5. State Strategy

Recommended approach:

- local feature state for UI concerns
- shared domain model for workshop editing
- storage adapter boundary for persistence

Suggested split:

- UI selection state in feature layer
- editable project document state in builder layer
- validation and calculations in domain layer
- persistence state and sync status in storage layer

Avoid:

- scattering workshop rules across many React components
- letting UI directly shape persistence payloads

## 6. Testing Strategy by Folder

### `domain/`

- unit tests for calculations and validation

### `storage/`

- adapter tests
- bundle serialization tests

### `server/`

- integration tests for project persistence, auth, and export

### `features/`

- component tests for builder, preview, and project creation flows

## 7. Seed Data Strategy

The LS library should be seeded centrally, not hard-coded in UI components.

Recommended seed responsibilities:

- create block definitions
- create language-specific content
- create relation data
- create input and output tags

This keeps the library portable across hosted and self-hosted modes.

## 8. Suggested Initial Build Order

1. define domain contracts
2. define storage adapter interface
3. implement guest IndexedDB adapter
4. build setup and builder screens against guest mode
5. add library and seed data
6. add manual preview and exports
7. add persisted server mode with SQLite
8. add auth
9. add AI review

## 9. Architectural Guardrails

- never let guest mode and persisted mode diverge in business rules
- never mutate library definitions from project editing
- keep AI integration behind a dedicated review service boundary
- keep export generation driven by one shared manual representation
- keep server-only secrets out of feature and domain layers
