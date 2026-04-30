# LS Stringsmith

## Visual Design Direction v0.1

This document defines the recommended visual direction for the application before implementation begins.

The goal is not just to make the app usable, but to give it a clear, intentional design language that matches the product:

- structured but not rigid
- calm but not sterile
- professional but still creative
- playful without becoming toy-like
- modular without looking like a generic kanban board

## Current Alpha Implementation Note

Last reviewed: 2026-04-30

The initial implementation now uses a cooler neutral palette, Teal/Navy accents,
an Inter-based system font stack, and an optional light/dark theme toggle in the
app shell. Those choices are the current alpha baseline in `app/globals.css`.

The warmer editorial palette and the `Source Sans 3` / `Space Grotesk` pairing
below remain useful direction context, but they are no longer an implicit
requirement. Reopening them should happen as an explicit visual design pass, not
as incidental cleanup.

## 1. Design Intent

The app should feel like a focused workshop design studio.

It is not:

- a whiteboard clone
- a sticky-note chaos surface
- an enterprise form application
- a playful brainstorming toy

It should instead feel like:

- a workshop architect's desk
- a system builder for facilitation flows
- a place to think clearly and assemble modules with intent

## 2. Product Mood

Primary mood attributes:

- deliberate
- clear
- calm
- intelligent
- tactile
- trustworthy
- joyful

Secondary mood attributes:

- creative
- exploratory
- reflective
- playful

## 3. Core Visual Metaphor

The visual metaphor should be a `modular studio board`.

The user is assembling sections and structures with visible flow logic, not dropping random notes onto an infinite canvas.

That means:

- cards should feel purposeful
- flow should be stronger than decoration
- hierarchy should be obvious
- the workshop should read like a designed composition
- small curatorial cues should help the user feel guided without losing control

## 4. Recommended Style Direction

### 4.1 Overall Look

The recommended direction is `warm editorial meets playful product studio`.

This combines:

- warm neutral backgrounds
- confident dark text
- strong but limited accent colors
- structured paneling
- restrained shadows
- generous spacing
- small moments of visual delight

The app should feel more like a crafted design tool than a default SaaS dashboard.

Playfulness should come from:

- shape and composition
- slightly more expressive contrast
- warm motion cues
- tactile cards and badges
- small "studio assistant" moments like flow cues, vibe cards, and add-next prompts

But these moments should be used sparingly.

- not every helpful cue should become a visible chip or card
- exception states should carry the stronger signals
- recommendation and AI hints should usually appear in context, not everywhere at once

It should not come from:

- noisy illustrations everywhere
- novelty UI patterns
- reduced clarity

### 4.2 Why This Direction Fits

- facilitation work benefits from visual calm
- users will spend time reading and writing
- the domain is human-centered, not purely technical
- flow design benefits from editorial hierarchy

## 5. Color System

The palette should avoid the overused purple/white AI-tool aesthetic.

Recommended palette direction:

- warm canvas base
- deep ink text
- slate and teal for structure
- amber for emphasis
- muted coral for warnings or critique
- soft green for positive review states

Implementation note:

- current alpha tokens use cooler canvas and surface values in `app/globals.css`
- future visual work should either refine that cool-neutral baseline or replace it deliberately across docs and CSS together

### 5.1 Core Palette

#### Neutrals

- `canvas-50`: `#F7F4ED`
- `canvas-100`: `#F0EBDD`
- `surface-0`: `#FFFDF8`
- `surface-1`: `#F7F1E5`
- `surface-2`: `#ECE4D5`
- `ink-900`: `#1D2430`
- `ink-700`: `#3E4A5A`
- `ink-500`: `#6A7686`
- `line-200`: `#D9D0BF`

#### Brand / Structure

- `teal-700`: `#1F5C5B`
- `teal-600`: `#2F7472`
- `teal-500`: `#4C8F8B`
- `navy-700`: `#22324A`
- `navy-500`: `#3F5878`

#### Accent

- `amber-500`: `#D39B2A`
- `amber-300`: `#F0C76B`
- `coral-500`: `#C96B4B`
- `coral-300`: `#E7A188`
- `green-600`: `#4E7C53`
- `green-300`: `#A9C79F`

### 5.2 Usage Rules

- backgrounds should stay mostly neutral
- accents should identify state or hierarchy, not flood the interface
- section boxes can use slightly tinted headers or side rails
- AI signals should use status colors, but not dominate the builder

## 6. Typography

The product needs typography with more character than a default app stack, while staying readable during long sessions.

### 6.1 Recommended Font Pairing

Primary UI and body:

- `Source Sans 3`

Display and section headings:

- `Space Grotesk`

Mono for data, tags, and technical metadata:

- `IBM Plex Mono`

Implementation note:

- current alpha UI uses an Inter-based system stack for display and body text
- `IBM Plex Mono` remains the mono preference where available

### 6.2 Typographic Roles

- app title and large section headings: `Space Grotesk`
- body, form inputs, inspector content, invitations: `Source Sans 3`
- metadata, badges, durations, status chips: `IBM Plex Mono`

### 6.3 Tone of Typography

- headings should feel intentional and modern
- body text should feel warm and legible
- metadata should feel compact and precise

## 7. Shape, Radius, and Surfaces

### 7.1 Shape Language

Recommended:

- medium rounded corners
- not overly soft
- not sharp and technical

Guidance:

- project cards: 18 to 22px radius
- section boxes: 20 to 24px radius
- block cards: 16 to 18px radius
- transition cards: 14 to 16px radius
- buttons and chips: 999px or 12px depending on component role

### 7.2 Surface Treatment

Use layered paper-like surfaces rather than flat gray boxes.

Suggested surface hierarchy:

- app background: warm canvas
- primary panels: light cream
- canvas work surface: slightly brighter
- selected cards: subtle border and shadow lift
- inspector: denser contrast than canvas for focus

### 7.3 Shadows

Shadows should be restrained and atmospheric.

Suggested shadow character:

- low blur, low opacity
- more like elevation cues than dramatic floating

## 8. Layout Philosophy

The app should feel structured and anchored.

### 8.1 Layout Principles

- fixed top bar
- persistent left library pane
- central builder canvas as the visual heart
- persistent right inspector on desktop
- vertical overall workshop progression
- horizontal progression inside sections
- subtle rhythm markers that make the chain feel composed rather than merely placed
- the currently active block can carry more UI weight than the surrounding blocks

### 8.3 Progressive Disclosure In The Builder

The Builder should not show every possible signal at the same time.

Recommended default visibility:

- global purpose
- day grouping if relevant
- section title, sub-goal, time, total duration
- compact structure cards in sequence
- one clearly selected block with richer inline editing
- review state only where it matters

Recommended contextual visibility:

- advanced filters behind a filter action
- section actions such as duplicate or delete behind a secondary action or menu
- rich AI reasoning in the inspector or on-demand review state
- warnings directly on the affected block or structure, not broadcast globally

Badge rule:

- use badges mainly for exceptions or unusual states
- avoid badges for every normal library item
- in the LS library, `in development` is a valid badge-worthy exception

Interaction rule:

- progressive disclosure should also shape controls and commands
- advanced section actions should live in contextual menus rather than in the main header row
- add flows should open a focused, local action surface instead of permanently exposing many insertion points
- selected items can reveal richer inline controls, while non-selected items stay calm and scannable

### 8.2 Density Strategy

The interface should be `compact enough for real work`, but not cramped.

That means:

- section boxes need room to breathe
- cards should support quick scanning
- long text should expand only on demand

## 9. Visual Hierarchy by Entity

### 9.1 Workshop Level

Visual treatment:

- subtle workspace frame
- clear project title
- short purpose summary visible near top
- not oversized, but always accessible

### 9.2 Day Group

Visual treatment:

- light structural band
- labeled divider row
- quieter than section boxes

### 9.3 Section Box

Section boxes are the primary design units.

They should visually stand out through:

- strong container edge or tinted header
- clear title and sub-goal separation
- visible total duration
- obvious horizontal chain area

Recommended enhancement:

- section header with soft teal or navy tint
- body on warm light surface

### 9.4 Block Card

Block cards should feel like modular building units.

They should communicate:

- what this structure is
- how long it takes
- whether invitation and notes are ready

The card should not attempt to show everything at once.

### 9.5 Transition Card

Transition cards should look distinct from blocks.

Recommended treatment:

- narrower than block cards
- lighter background
- more connective than primary
- visually placed like a hinge between blocks

## 10. Component-Level Design Direction

### 10.1 Top Bar

Should feel clean, editorial, and stable.

Include:

- strong title placement
- quiet status indicators
- prominent preview/export actions

Recommended:

- thin divider line
- warm background
- compact control grouping

### 10.2 Library Pane

The library should feel curated, not technical.

Recommended:

- card grid or vertically stacked cards
- clear filter chips
- comfortable search field
- subtle category grouping

LS cards should visually reference the established LS icon system where appropriate.

### 10.3 Canvas

The canvas should be the visual focal point.

Recommended:

- slightly elevated work surface
- enough whitespace between sections
- background pattern extremely subtle, if used at all

Possible background treatment:

- soft grain or dot pattern at very low contrast

### 10.4 Inspector

The inspector should feel denser and more focused than the canvas.

Recommended:

- stronger contrast
- sticky header with selected item title
- sectioned content blocks

### 10.5 Review States

Review feedback should be readable at a glance.

Recommended:

- traffic-light chip
- short score label in mono
- compact summary block
- alternative suggestions as insertable cards

## 11. Motion and Interaction Style

Motion should support orientation, not decoration.

### 11.1 Motion Principles

- short transitions
- meaningful movement
- minimal bounce
- subtle opacity and elevation changes

### 11.2 Recommended Motion Moments

- section creation
- block insertion
- drag-and-drop placement hints
- invitation expand/collapse
- inspector content switching
- review panel opening

### 11.3 Motion Tone

- confident
- restrained
- slightly tactile

## 12. Status and Feedback Design

### 12.1 Save State

Should be visible but quiet.

Examples:

- saved
- saving
- local only
- not synced

### 12.2 AI State

Should be explicit and transparent.

Examples:

- AI enabled
- AI disabled
- review available
- review unavailable in current mode

### 12.3 Completion Signals

Use subtle indicators for:

- invitation present
- notes present
- transition note present
- review completed

## 13. Accessibility Direction

The design should stay readable in long planning sessions.

Requirements:

- strong text contrast
- states not color-only
- sufficient hit areas
- readable card text at normal zoom
- keyboard-visible focus styles

## 14. Screen-Specific Visual Guidance

### 14.1 Projects Screen

Look and feel:

- gallery of workshop artifacts
- inviting but not playful
- project cards with strong title hierarchy

Recommended accent:

- colored top strip or badge cluster per project card

### 14.2 Setup Screen

Look and feel:

- quieter and more form-driven than builder
- still editorial and spacious

### 14.3 Builder Screen

Look and feel:

- the most characteristic screen in the product
- clear modular composition
- strong section boxes
- calmer background than Miro

### 14.4 Preview Screen

Look and feel:

- document-like
- typographically strong
- optimized for reading and printing
- should still feel like a run sheet, with prep focus and facilitator cues visible where they are useful
- should surface workshop-level review calmly and once, rather than scattering section diagnostics across the manual
- when AI assistance is off, replace review chrome with a calm explanatory note instead of empty diagnostic space

### 14.5 Setup Screen

Look and feel:

- softer than the builder, but not empty or generic
- should help the user sense where deeper facilitation prep will be needed
- side-panel cues such as hotspots, step-flow coverage, or draft warnings should feel editorial and calm rather than dashboard-like

## 15. Initial Design Tokens

The following token direction is recommended for later implementation.

### 15.1 Fonts

- `--font-display: "Space Grotesk", "Avenir Next", sans-serif;`
- `--font-body: "Source Sans 3", "Helvetica Neue", sans-serif;`
- `--font-mono: "IBM Plex Mono", monospace;`

### 15.2 Radius

- `--radius-card: 18px;`
- `--radius-section: 24px;`
- `--radius-chip: 999px;`

### 15.3 Shadow

- `--shadow-soft: 0 8px 24px rgba(29, 36, 48, 0.08);`
- `--shadow-focus: 0 10px 30px rgba(31, 92, 91, 0.14);`

### 15.4 Spacing

- `--space-2: 8px;`
- `--space-3: 12px;`
- `--space-4: 16px;`
- `--space-5: 20px;`
- `--space-6: 24px;`
- `--space-8: 32px;`
- `--space-10: 40px;`

## 16. Recommended Visual Signature

If we want the product to feel memorable, the signature should come from this combination:

- warm editorial canvas
- strong modular section containers
- purposeful LS icon usage
- visible but restrained flow connectors
- expressive headings
- precise mono metadata

That combination should make the app recognizable without being flashy.

## 17. Design Risks to Avoid

- making it look like a generic kanban tool
- making it look like a chaotic whiteboard
- too many bright colors at once
- too much text visible on every card
- dark mode as default aesthetic
- purple AI-tool styling
- excessive glassmorphism or ornamental effects

## 18. Recommended Next Design Step

The next design step should be a `screen-by-screen visual composition pass` for:

- Projects
- Setup
- Builder
- Preview

The Builder screen should be designed first because it defines the identity of the product.
