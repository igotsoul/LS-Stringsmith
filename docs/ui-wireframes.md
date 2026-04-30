# Liberating Structure Designer

## UI Wireframe Specification v0.1

This document translates the product specification into screen-level and interaction-level UI guidance for design and implementation.

The application is desktop-first, browser-based, English-first, and optimized for focused workshop design rather than freeform whiteboarding.

## 1. UX Goals

- keep the workshop flow visually legible at all times
- make section goals the main structural anchor
- let users edit invitations without leaving the builder
- keep LS details accessible without overloading cards
- make AI support visible but non-intrusive
- support guest users without making the app feel limited

## 2. Navigation Model

Primary navigation:

- Projects
- Builder
- Preview

Utility actions:

- language switch
- storage mode indicator
- AI availability indicator
- account or guest status

Suggested top-level navigation behavior:

- projects is the home view
- builder is entered when a project is opened
- preview is reachable from the active project only

## 3. Screen Inventory

- Projects Screen
- Workshop Setup Screen
- Workshop Builder Screen
- Manual Preview Screen
- Export Dialog
- Import Dialog
- Review Panel

## 4. Projects Screen

### 4.1 Primary Purpose

- start quickly
- continue existing work
- distinguish local and persisted projects
- offer import/export entry points
- allow switching the active storage runtime without leaving the projects view

### 4.2 Layout

```text
+----------------------------------------------------------------------------------+
| Top Bar: logo | Projects | language | storage mode | account / guest            |
+----------------------------------------------------------------------------------+
| Actions: [New Project] [Import Project Bundle]                                  |
+----------------------------------------------------------------------------------+
| Storage Runtime Card: [Guest local] [Workspace draft] [Server draft] explainer  |
+----------------------------------------------------------------------------------+
| Claim Card (server draft only): email -> request link -> open link -> claim     |
+----------------------------------------------------------------------------------+
| Section: Recent Projects                                                        |
| +------------------+  +------------------+  +------------------+                |
| | Project Card     |  | Project Card     |  | Project Card     |                |
| | title            |  | title            |  | title            |                |
| | goal preview     |  | goal preview     |  | goal preview     |                |
| | last updated     |  | last updated     |  | last updated     |                |
| | guest/account    |  | guest/account    |  | guest/account    |                |
| +------------------+  +------------------+  +------------------+                |
+----------------------------------------------------------------------------------+
| Section: Local Projects / Cloud Projects                                        |
+----------------------------------------------------------------------------------+
```

### 4.3 Project Card Content

- project title
- one-line goal preview
- number of sections
- last updated timestamp
- language
- storage badge: local or cloud
- optional AI enabled badge

### 4.3a Storage Runtime Card

- shows current storage target
- explains the difference between guest local, workspace draft, and server draft
- allows switching modes without leaving the screen

### 4.3b Server Draft Claim Card

- visible only in server draft mode
- shows auth state separately from project ownership state
- supports local hosted-style magic-link sign-in inside the running app instance
- lets a signed-in identity claim or release the current server draft

### 4.4 Empty State

- short explanation of what the app does
- primary CTA: New Project
- secondary CTA: Import Project Bundle

## 5. Workshop Setup Screen

### 5.1 Primary Purpose

- capture the framing of the workshop before detailed section design starts
- establish a valid initial project state
- help the facilitator notice where deeper preparation will likely be needed

### 5.2 Layout

```text
+----------------------------------------------------------------------------------+
| Header: Back to Projects | Project Title | Save State | Continue to Builder      |
+----------------------------------------------------------------------------------+
| Left column                                      | Right column                  |
|--------------------------------------------------|-------------------------------|
| Global Purpose                                   | Project Summary               |
| Context                                          | facilitation hotspots         |
| Target Audience                                  | step-flow coverage            |
| Participant Count                                | language                      |
| Format                                           | AI enabled status             |
| Project Language                                 | AI enabled toggle             |
|--------------------------------------------------|-------------------------------|
| Day Groups (optional)                                                            |
| Sections list with editable title and sub-goal                                   |
| [Add Section] [Add Day Group]                                                    |
+----------------------------------------------------------------------------------+
```

### 5.3 Validation Rules

- global purpose should be present before leaving setup
- at least one section must exist
- each section must have at least a temporary title or sub-goal placeholder

### 5.4 Setup Exit

- the user can continue to builder even if details are still rough
- incomplete fields produce soft warnings, not hard blockers
- setup should surface draft sections or higher-prep modules before the user enters detailed builder work

## 6. Workshop Builder Screen

### 6.1 Primary Purpose

- build the workshop flow from sections and linear chains
- edit invitations inline
- keep flow, goals, and details visible together

### 6.2 Core Layout

```text
+---------------------------------------------------------------------------------------------------+
| Top Bar: Projects | project title | language | AI status | save state | Preview | Export         |
+---------------------------------------------------------------------------------------------------+
| Library Pane                    | Builder Canvas                                      | Inspector  |
|---------------------------------|-----------------------------------------------------|------------|
| Search                          | Workshop Header: goal, context summary, actions     | context-   |
| Filters                         |-----------------------------------------------------| sensitive  |
| Result Cards                    | Day Group (optional)                                | detail     |
| - LS card                       |  +-----------------------------------------------+   | editor     |
| - neutral block card            |  | Section Box                                    |   |            |
|                                 |  | sub-goal                                       |   |            |
|                                 |  | duration                                       |   |            |
|                                 |  | [Block] [Transition] [Block] [Transition] ... |   |            |
|                                 |  +-----------------------------------------------+   |            |
|                                 |                                                     |            |
|                                 |  +-----------------------------------------------+   |            |
|                                 |  | Section Box                                    |   |            |
|                                 |  +-----------------------------------------------+   |            |
+---------------------------------------------------------------------------------------------------+
```

### 6.3 Top Bar Behavior

Required controls:

- back to projects
- project title
- project language
- guest/cloud indicator
- AI enabled indicator
- save status
- preview action
- export action

Optional controls later:

- duplicate project
- runtime settings

### 6.4 Library Pane

#### Search behavior

- free text search
- live results
- searchable fields should include name, purpose, situations, input, output

#### Filter groups

- advanced filters should be available, but do not all need to be visible by default
- the default library state should emphasize search plus a lightweight filter entry point
- active filters can be summarized compactly instead of rendered as a long row of pills
- use a filter popover or menu rather than a permanently expanded filter shelf
- the primary category filter should support the official Matchmaker categories:
  - Share
  - Reveal
  - Analyze
  - Strategize
  - Help
  - Plan
- labels should localize with the UI language, e.g. German labels in German mode

#### Card content

- standard LS icon
- name
- short description
- default duration
- quick tags
- selecting a library card should reuse the main inspector rather than opening a separate detail world
- the inspector should allow `Use in this section` for the selected library entry
- related and alternative structures should be inspectable from the same inspector area
- optional fit or "best next move" cue for the currently selected section
- do not use badges for every normal LS card
- use a badge primarily for exception states such as `LS in development`
- recommendation cues should be more visual than plain text, but still compact

#### Card actions

- drag into section
- click to inspect
- add to selected section

### 6.5 Builder Canvas

The canvas is not an open whiteboard. It is a structured flow editor.

Design rules:

- sections flow vertically down the page
- block chains flow horizontally inside each section
- optional day groups wrap one or more sections
- the current workshop flow must be visually obvious without zooming or panning complexity
- the canvas may use lightweight rhythm cues such as story captions, pulse notes, or flow compass chips

Visibility rules:

- avoid stacking too many chips, helper cards, and meta rows at once
- keep the base canvas focused on flow, sequence, and the currently active edit target
- move secondary guidance into the inspector, contextual review, or overflow actions

### 6.6 Section Box

#### Section header

- section title
- sub-goal
- optional time field
- total calculated duration
- AI review section button
- a compact `More` action for duplicate, move, note, collapse, or archive actions

#### Section content

- horizontal row of block cards and transition cards
- clear insertion affordances between blocks
- add block affordance at start and end
- optional compact tone chips to signal the intended emotional character of the section

Default card behavior:

- every block should stay readable in compact mode
- only the selected block needs full inline editing controls
- non-selected blocks can show a shortened invitation preview instead of the full editor
- transitions can also become the active selection and should then receive a stronger visual focus

#### Section states

- empty section
- partially filled section
- validated section
- review warning state
- collapsed summary state
- expanded working state

#### Empty section UX

- clear prompt to add the first block
- option to drag from library or add a neutral block quickly
- for end-of-chain insertion, prefer a contextual add menu over many permanently visible insertion controls

#### Rich section cues

- section boxes can include compact narrative or energy cues
- transition from one block to the next should feel intentionally staged
- an end-of-chain add card is preferred over a tiny plus icon
- if these cues make the section visually noisy, they should move behind contextual review or inspector detail

### 6.7 Block Card

#### Card hierarchy

- icon
- title
- duration
- invitation editor preview
- metadata/status row

#### Metadata/status row

- note status
- input/output status
- source badge
- AI review status when available

#### Block interactions

- click selects block and opens block mode in inspector
- invitation is editable directly in card
- duration can be adjusted quickly
- block can be moved within the section
- block can be deleted

#### Invitation interaction

- compact by default
- expands on focus or explicit expand action
- supports multi-line editing
- shows placeholder text when empty

Suggested placeholder:

- "Add invitation for this structure..."

### 6.8 Transition Card

#### Purpose

- make facilitation logic between blocks explicit
- represent the output-to-input handoff

#### Card content

- short transition note preview
- transition duration
- warning or completion indicator

#### Interactions

- click selects transition
- quick edit in card optional
- full edit in inspector
- transition selection should visually read as a first-class selection state, not as a weak secondary state

Suggested placeholder:

- "Describe how you move from this block to the next..."

### 6.9 Inspector Pane

The inspector is a fixed contextual side panel. It should never replace the canvas, only deepen the selected item.

#### Inspector tabs or sections

- overview
- notes
- structure details
- review

Interaction note:

- if tabs add unnecessary chrome, prefer a single stacked inspector with clear content sections
- fit signals can be summarized in a lightweight text line rather than as multiple chips

#### Section inspector mode

- section title
- sub-goal
- optional time field
- section notes
- section-level AI review details

#### Block inspector mode

- block name
- source badge
- full LS description
- LS steps
- expandable structure flow editor for per-step sub-prompts and facilitator cues
- invitation editor
- facilitator notes
- input notes
- output notes
- duration override
- risks/prerequisites
- related or alternative structures
- block-level AI review details

Structure flow guidance:

- do not hide LS step configuration in a generic context menu
- the selected LS should expose an expandable step-flow area in the inspector
- each step can hold:
  - step title
  - step role
  - sub-prompt
  - facilitator cue
- harvest or debrief steps may have facilitator guidance without a participant-facing prompt

#### Transition inspector mode

- from block
- to block
- transition note editor
- transition duration
- transition-related review comments if available

### 6.10 Review Panel Behavior

AI feedback should be visible on demand, not permanently expanded.

Recommended behavior:

- clicking a review action opens or focuses the review area in the inspector
- review result includes:
  - traffic light status
  - score label
  - explanation by dimension
  - alternatives
- suggested alternatives can be inserted into the chain from the review panel

### 6.11 Day Group Layout

Day groups are optional structural wrappers.

Suggested rendering:

- day label row above contained sections
- sections remain primary design objects
- day grouping should not dominate the visual model

## 7. Manual Preview Screen

### 7.1 Primary Purpose

- show the workshop as a readable facilitation plan
- catch omissions before export
- behave like a run sheet, not only like a print preview
- scale detail by facilitation complexity, showing deeper step flow only where it helps

### 7.2 Layout

```text
+----------------------------------------------------------------------------------+
| Header: Back to Builder | Manual Preview | Export Markdown | Export HTML | PDF   |
+----------------------------------------------------------------------------------+
| Side Panel: workshop review | warnings | run-sheet depth                          |
+----------------------------------------------------------------------------------+
| Workshop Header                                                                  |
| Context                                                                          |
| Day Group / Section                                                              |
|   Block 1                                                                        |
|   Transition                                                                     |
|   Block 2                                                                        |
|   optional structure flow / facilitator cues                                     |
| Section Notes                                                                    |
+----------------------------------------------------------------------------------+
```

### 7.3 Warning Summary

Warnings should be soft, actionable, and grouped.

Examples:

- section without blocks
- block without invitation
- transition without note
- section goal too vague

### 7.4 Preview Styling Goal

- optimized for readability
- not an editable design surface
- suitable for printing and PDF generation
- should keep compact blocks compact and reserve detailed sub-steps for structures with real facilitation choreography
- should show workshop-level review once, not repeat review callouts for every section

### 7.4a Review Visibility Rule

- workshop-level review is visible in preview
- section-level review is intentionally hidden in preview
- section-level review remains available in builder where it supports authoring decisions
- if AI assistance is disabled for the project, preview shows no workshop review and instead explains that review guidance is paused

### 7.5 Print Behavior

- include a visible `Print / Save PDF` action in the preview header
- printing should use a dedicated print stylesheet rather than the normal screen chrome
- app navigation, side panels, and non-manual UI should be hidden in print
- the printable document should use white surfaces, reduced decoration, and page-friendly spacing
- PDF output should be derived from this same printable view
- print view may include a compact print-only cover/meta block with workshop title, context, and final prep notes
- day boundaries can introduce explicit page breaks when that improves readability

## 8. Export Dialog

### 8.1 Export Options

- markdown
- printable HTML
- PDF
- project bundle

### 8.2 Export Controls

- language
- include review summary on/off
- include empty notes fields on/off

## 9. Import Dialog

### 9.1 Purpose

- allow users to restore a project bundle locally or into persisted mode

### 9.2 Required UX

- show schema compatibility result
- show project title and metadata preview
- allow user to confirm import target
- warn clearly when a bundle is legacy, incomplete, or comes from a different app/runtime

## 10. Key UI States

### 10.1 Guest Runtime State

Visible indicators:

- guest badge
- local storage label
- claim or save-to-account action if available

### 10.2 No-AI Runtime State

Visible indicators:

- AI disabled label
- review buttons hidden or disabled with explanation

### 10.3 Empty Project State

- one initial section exists
- clear call to set sub-goal and add first block

### 10.4 Loading and Saving

- autosave or save-state indicator
- avoid modal interruptions
- save state should be visible but quiet

## 11. Interaction Rules

- the builder should prefer inline editing for fast iteration
- the inspector should handle depth, not primary editing burden
- drag-and-drop must preserve order deterministically
- transition cards must remain attached to adjacency logic
- no action should silently change a library definition
- AI suggestions must require explicit user acceptance

## 12. Accessibility and Usability Notes

- keyboard navigation should be possible for major workflows
- drag-and-drop should have non-pointer alternatives where feasible
- contrast must support long workshop design sessions
- invitation text areas should be comfortable for writing
- badges and icons must not be the only carrier of meaning

## 13. Responsive Strategy

Primary target:

- desktop and laptop editing

Secondary target:

- tablet and smaller laptop review

Mobile strategy for MVP:

- allow read-oriented preview and project browsing
- do not optimize full builder editing for phones in V1

## 14. Suggested Design Direction

- structured and calm rather than playful
- visually modular, like a purposeful system builder
- use the known LS icon language where legally and technically appropriate
- rely on hierarchy, spacing, and status cues rather than heavy chrome
- keep the builder denser than a whiteboard tool, but lighter than a form-heavy enterprise app

## 15. Open UX Topics for Later Validation

These do not block implementation but should be validated during design or testing:

- exact density of block cards in long sections
- whether invitation editing needs a richer inline editor
- whether review details fit best in inspector only or in a slide-over panel
- whether day groups need collapsed states
- whether markdown export options need presets
