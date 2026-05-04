# LS Stringsmith

LS Stringsmith is a browser-first workshop design app for facilitators who use
Liberating Structures. It helps you shape a workshop from purpose to facilitation
manual: define the context, compose sections and LS strings, refine invitations,
capture facilitator notes, review the flow, and export a runnable draft.

Repository: [github.com/igotsoul/LS-Stringsmith](https://github.com/igotsoul/LS-Stringsmith)

## What You Can Do

- Create and manage multiple workshop projects.
- Describe workshop purpose, audience, format, energy, trust, conflict, and decision needs.
- Build a section-based workshop flow instead of one flat sequence.
- Search and add Liberating Structures blocks, including official category cues and icons.
- Edit invitations, transitions, section notes, and block-level facilitator notes.
- Group sections into simple day lanes and move sections between them.
- Use assistive review feedback for blocks, sections, and the whole workshop.
- Export a Markdown manual, a portable project bundle, or a print/PDF-ready preview.
- Import reviewed project bundles into the current storage mode.
- Work without an account in browser-local modes.

This is an alpha. It is useful for real drafting, but it is not yet a full
collaboration product, account workspace, template marketplace, or production
multi-tenant service.

## Storage Options

LS Stringsmith currently has three runtime storage modes:

| Mode | Where data lives | Best for | Notes |
| --- | --- | --- | --- |
| `Guest local` | Current browser, via IndexedDB with localStorage fallback | Fast no-login work | Data stays on this device/browser. Export a bundle before switching devices or clearing browser data. |
| `Workspace draft` | Current browser, separate persisted project list | Public demos and account-flow rehearsals | Users do not share data with each other because drafts stay in their own browser. |
| `Server draft` | The running app server, backed by SQLite in `.runtime/sqlite` | Local self-host or single-instance experiments | This is not real collaboration yet. It has a magic-link and claim flow, but no full account-level project directory or permission model. |

For a public alpha demo, prefer `Workspace draft` or `Guest local`. That gives
people a safe test space without letting visitors overwrite each other's work.

## AI Assistance

AI is optional. The app always has a local heuristic review fallback, so the core
builder remains usable when AI is disabled, unavailable, or misconfigured.

Current provider support:

- `off`: no external AI call; local heuristic review only.
- `groq`: server-side Groq review through an OpenAI-compatible chat endpoint.

Provider keys are read only on the server from environment variables. Do not put
shared provider keys into browser code or a public repository.

Recommended public-alpha stance:

- Public browser demo: `LSD_AI_PROVIDER=off`.
- Local/self-host install: users may add their own `GROQ_API_KEY` in `.env.local`.
- Shared hosted AI demo: defer until there is rate limiting, usage monitoring, and abuse protection.

## Local Installation

### Requirements

- Node.js 24 recommended. `Server draft` uses Node's built-in SQLite module.
- pnpm for dependency installation.

If pnpm is not available, install it through Corepack:

```bash
corepack enable
corepack prepare pnpm@latest --activate
```

### Setup

```bash
git clone https://github.com/igotsoul/LS-Stringsmith.git
cd LS-Stringsmith
pnpm install
cp .env.example .env.local
pnpm dev
```

Open the local URL printed by Next.js, usually:

```text
http://localhost:3000
```

For a direct localhost run on port `3001`:

```bash
pnpm dev:local
```

After dependencies are installed, Node can also run package scripts directly:

```bash
node --run test
node --run build
```

## Configuration

Copy `.env.example` to `.env.local` and adjust only what you need. `.env.local`
is ignored by Git and must not be committed.

| Variable | Values | Purpose |
| --- | --- | --- |
| `LSD_AI_PROVIDER` | `off`, `groq` | Selects the AI provider. Defaults to `groq` when `GROQ_API_KEY` exists, otherwise `off`. |
| `GROQ_API_KEY` | secret string | Enables Groq-backed review calls server-side. |
| `GROQ_BASE_URL` | URL | Optional OpenAI-compatible base URL override. Defaults to Groq's API base. |
| `LSD_AI_MODEL` | model id | Overrides the default review model. Current default is `openai/gpt-oss-20b`. |
| `LSD_AI_TIMEOUT_MS` | positive integer | Provider timeout in milliseconds. Default is `12000`. |
| `LSD_MAIL_PROVIDER` | `demo`, `http` | Magic-link delivery mode for `Server draft` claim flow. |
| `LSD_MAIL_HTTP_ENDPOINT` | URL | Required when `LSD_MAIL_PROVIDER=http`. Receives activation-link payloads. |
| `LSD_MAIL_HTTP_BEARER_TOKEN` | secret string | Optional bearer token for the HTTP mail hook. |
| `LSD_MAIL_FROM` | email/string | Optional sender metadata for HTTP mail delivery. |
| `LSD_MAIL_PROVIDER_LABEL` | string | Optional UI/provider label for mail delivery. |

The default local mail mode is `demo`. It shows an activation link in the app so
you can test the claim flow without configuring a real mail provider.

## Walkthrough

1. Open `Projects`.
   Create a new project, duplicate the demo, or import a project bundle. Choose
   `Guest local` or `Workspace draft` for browser-only work.

2. Go to `Setup`.
   Add the workshop purpose, audience, duration, format, language, energy level,
   trust level, conflict level, and decision need. Toggle AI per project if your
   environment supports it.

3. Move to `Builder`.
   Add sections, search the LS library, append structures to a section, edit
   invitations, tune transitions, and capture facilitator notes. Use day labels
   when a workshop spans more than one day or phase.

4. Review the flow.
   Use block, section, and workshop review cues as coaching input. When AI is
   off, the local heuristic review keeps the flow useful.

5. Open `Preview`.
   Review the facilitation manual, include notes where useful, export Markdown,
   save a portable project bundle, or print/save as PDF.

## Public Demo Guidance

The safest public alpha is a browser-only demo:

- storage: `Guest local` or `Workspace draft`
- AI: `LSD_AI_PROVIDER=off`
- auth/mail: leave demo-only or hide server claim messaging
- server persistence: do not present `Server draft` as production multi-user storage

Hosting options:

- GitHub Pages is attractive for a zero-cost static demo, but it only serves
  static files. The current Next.js API routes, server draft mode, and SQLite
  persistence will not run there without a static/export-oriented demo build.
- Vercel Hobby or Netlify Free can run a Next.js alpha demo at no cost within
  their free-tier limits. For this app, still treat the hosted demo as
  browser-local unless you add durable storage and abuse protection.
- A real shared server demo should wait until the app has durable hosted storage,
  request limits, AI usage controls, and clearer account semantics.

## Development Scripts

```bash
pnpm dev
pnpm dev:local
pnpm typecheck
pnpm test
pnpm build
```

## Project Docs

- [Product Specification](./docs/product-spec.md)
- [V1 Baseline](./docs/v1-baseline.md)
- [Decision Log](./docs/decision-log.md)
- [Implementation Backlog](./docs/implementation-backlog.md)
- [Alpha Smoke Checklist](./docs/alpha-smoke-checklist.md)
- [UI Wireframe Specification](./docs/ui-wireframes.md)
- [Visual Design Direction](./docs/design-direction.md)
- [Data Schema Draft](./docs/schema-draft.md)

## License

The LS Stringsmith source code is licensed under the [MIT License](./LICENSE).
Third-party Liberating Structures assets and materials remain under their own
licenses; see [Third-Party Notices](./THIRD_PARTY_NOTICES.md).
