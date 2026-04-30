# Liberating Structure Designer

## LS Icon Strategy v0.2

This note documents the current recommendation for handling Liberating Structures icons in the prototype and later product implementation.

## Current Decision

The design review on 2026-04-29 supersedes the earlier placeholder strategy:

- official Liberating Structures icons are used
- rights are considered cleared for this project
- icons are extracted from the official German LS pages
- icon colors stay unchanged
- icons are stored locally under `public/icons/official/`

The implementation source of truth is:

- `domain/workshop/ls-icon-sources.json`
- `scripts/sync-ls-icons.mjs`

Run `pnpm sync:ls-icons` or, when package-manager shims are unavailable,
`node scripts/sync-ls-icons.mjs`.

## Source Finding

The reference site at [liberatingstructures.de](https://liberatingstructures.de/liberating-structures-menue/) uses dedicated image assets for individual structures, for example:

- `124A-Rand.png` for `1-2-4-All`
- `AI-Rand.png` for `Appreciative Interviews`
- `TRIZ-Rand.png` for `TRIZ`
- `WINFY-Rand.png` for `What I Need From You`

The same page footer states that the work is licensed under:

- [Creative Commons BY-NC 3.0](https://creativecommons.org/licenses/by-nc/3.0/)

## Product Guidance

The Builder should be implemented with an icon slot model:

- each LS definition can point to an `icon_ref`
- the UI should support swapping placeholder and final icons
- the visual layout should not depend on any one icon style

The current app keeps that slot model through the `IconId` field and the shared
`LsIcon` component, while the official assets are mapped through the local icon
manifest.
