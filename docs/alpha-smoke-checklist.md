# LS Stringsmith

## Alpha Smoke Checklist

Last updated: 2026-05-04

Use this checklist before tagging or sharing an internal alpha build. It is intentionally short and flow-based.

## Commands

- `pnpm typecheck`
- `pnpm test` or `node --run test`
- `pnpm build`

## Local Server

- Start with `pnpm dev:local`.
- Open `http://127.0.0.1:3001/projects`.
- Confirm Projects, Setup, Builder, and Preview routes return without visible runtime errors.

## Core Flows

- Projects: create, rename, duplicate, delete, import bundle, download bundle.
- Setup: edit project metadata, add section, add day, add section to day, delete day when more than one day exists.
- Builder: add block, remove block, move block within a section, move block between sections.
- Builder days: add day, rename day, move a selected section into another existing day.
- Builder notes: add section prep notes and selected block notes, then reload and confirm they persist.
- Export: download Markdown manual from Builder and Preview.
- Export: download project bundle from Builder and Projects.
- Preview: toggle Notes in script, confirm section notes and selected block notes appear when enabled.
- Preview: use Print / Save PDF and confirm app chrome is hidden in print preview.

## Error And Empty States

- Import invalid JSON and confirm the reviewed import flow reports a clear error.
- Import a bundle with no sections and confirm it is rejected.
- Try deleting the last remaining section and confirm the app keeps at least one section.
- Disable AI assistance and confirm local/fallback review messaging still keeps the flow usable.

## Release Notes

- Record the commit hash.
- Confirm `README.md`, `docs/v1-baseline.md`, `docs/decision-log.md`, and `docs/implementation-backlog.md` describe any product-scope changes.
- Keep `THIRD_PARTY_NOTICES.md` current if any LS assets or external content changed.
