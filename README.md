# LS Stringsmith

Product and implementation groundwork for a browser-first application that helps facilitators forge purposeful Liberating Structures strings.

Repository: [github.com/igotsoul/LS-Stringsmith](https://github.com/igotsoul/LS-Stringsmith)

## Current App Scaffold

- Next.js App Router scaffold with TypeScript
- routed screens for `Projects`, `Setup`, `Builder`, and `Preview`
- shared `AppShell`, top navigation, and studio-style global design layer
- reusable domain seed data for workshop sections, blocks, transitions, and inspector content
- shared client-side project store across screens
- switchable browser storage runtime: `guest local` and `workspace draft`
- SQLite-backed `server draft` mode through the local app instance
- provider-ready magic-link auth with local demo mail, HTTP delivery hook, and claim flow for `server draft`
- automatic one-time migration of legacy JSON server drafts into SQLite
- local guest persistence via IndexedDB with localStorage fallback
- editable setup metadata and section story arc
- quick-add builder flow for appending blocks into sections
- bundle export with richer metadata plus reviewed import validation UI
- builder export menu for Markdown, project bundle, and preview/print PDF
- local project bundle import/export and Markdown export
- editable day labels and section movement between day lanes
- persisted section notes and block facilitator notes
- lightweight Node test coverage for workshop mutations, Markdown export, and bundle import checks
- print-friendly preview surface with `Print / Save PDF`

Key entry points:

- [App Layout](./app/layout.tsx)
- [Projects Screen](./features/projects/projects-screen.tsx)
- [Setup Screen](./features/setup/setup-screen.tsx)
- [Builder Screen](./features/builder/builder-screen.tsx)
- [Preview Screen](./features/preview/preview-screen.tsx)
- [Demo Project Seed](./domain/workshop/demo-project.ts)
- [Project Store Provider](./components/providers/project-store-provider.tsx)
- [Local Persistence Adapter](./storage/projects/indexeddb.ts)
- [Storage Runtime Modes](./storage/projects/storage-mode.ts)
- [Project Storage Adapters](./storage/projects/adapters.ts)
- [Server Draft Route](./app/api/persisted-projects/[projectId]/route.ts)
- [Project Mutations](./domain/workshop/project-mutations.ts)
- [Project Bundle Format](./domain/workshop/project-bundle.ts)
- [Markdown Export](./domain/workshop/export-markdown.ts)
- [Domain Smoke Tests](./tests/workshop-domain.test.ts)

## Current Documents

- [Product Specification](./docs/product-spec.md)
- [V1 Baseline](./docs/v1-baseline.md)
- [Decision Log](./docs/decision-log.md)
- [Implementation Backlog](./docs/implementation-backlog.md)
- [Alpha Smoke Checklist](./docs/alpha-smoke-checklist.md)
- [UI Wireframe Specification](./docs/ui-wireframes.md)
- [Visual Design Direction](./docs/design-direction.md)
- [Screen Composition Blueprint](./docs/screen-composition.md)
- [Design Tokens](./docs/design-tokens.css)
- [LS Icon Strategy](./docs/icon-strategy.md)
- [Data Schema Draft](./docs/schema-draft.md)
- [Recommended Codebase Structure](./docs/codebase-structure.md)

## Prototype

- [Interactive UI Prototype](./prototype/index.html)

## License

The LS Stringsmith source code is licensed under the [MIT License](./LICENSE).
Third-party Liberating Structures assets and materials remain under their own
licenses; see [Third-Party Notices](./THIRD_PARTY_NOTICES.md).

## Run Locally

```bash
pnpm install
pnpm dev
```

For a direct localhost test outside the Codex sandbox:

```bash
pnpm dev:local
```

The Next.js runtime in this environment uses the checked-in `scripts/next-with-wasm.mjs`
launcher so the app can fall back to the installed SWC WASM package when native SWC
loading is blocked by the local macOS/tooling setup.

Additional scripts:

```bash
pnpm typecheck
pnpm test
pnpm build
```

In environments without `pnpm` on the path, Node 24 can run the package script directly:

```bash
node --run test
```

## Current Direction

- browser-first web app
- self-contained and easy to self-host
- guest mode with local browser storage
- workspace draft runtime as a bridge toward persisted mode
- server draft runtime through the app server backed by SQLite
- persisted mode with SQLite
- AI optional and assistive only
- English-first with German support

## Suggested Next Step

Continue with the next implementation slice:

1. continue Alpha Hardening & Release Readiness
2. add broader storage, import, and UI smoke coverage
