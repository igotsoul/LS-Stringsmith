# Liberating Structure Designer

## Screen Composition Blueprint v0.1

This document turns the visual direction into concrete screen composition guidance for design and front-end implementation.

The focus is on desktop and laptop layouts, because that is the primary working mode for the builder.

## 1. Global Layout Rules

### 1.1 Desktop Breakpoint Assumption

Primary composition target:

- 1440px wide desktop

Secondary composition target:

- 1280px laptop

### 1.2 Persistent Regions

On desktop, the main application should use:

- top app bar
- optional left navigation context
- left library pane in builder
- central canvas or document area
- right inspector or utility pane when relevant

### 1.3 Width Strategy

Recommended page max width outside the builder:

- 1280px

Recommended builder full-width strategy:

- use the available viewport width
- preserve comfortable side padding

## 2. Projects Screen Composition

### 2.1 Purpose

The screen should make it easy to:

- start quickly
- resume confidently
- distinguish local and persisted work

### 2.2 Composition

```text
+--------------------------------------------------------------------------------------------------+
| Top Bar                                                                                          |
| logo | Projects | language | runtime mode | account/guest | settings                             |
+--------------------------------------------------------------------------------------------------+
| Hero Row                                                                                         |
| "Design facilitation flows with Liberating Structures."                                          |
| [New Project] [Import Bundle]                                                                    |
+--------------------------------------------------------------------------------------------------+
| Filter / Segment Row                                                                             |
| [All] [Local] [Cloud] [Recently Updated]                                                         |
+--------------------------------------------------------------------------------------------------+
| Project Grid                                                                                     |
| +----------------------------+  +----------------------------+  +----------------------------+    |
| | title                      |  | title                      |  | title                      |    |
| | purpose preview            |  | purpose preview            |  | purpose preview            |    |
| | sections | language        |  | sections | language        |  | sections | language        |    |
| | local/cloud | ai status    |  | local/cloud | ai status    |  | local/cloud | ai status    |    |
| | last updated               |  | last updated               |  | last updated               |    |
| +----------------------------+  +----------------------------+  +----------------------------+    |
+--------------------------------------------------------------------------------------------------+
```

### 2.3 Visual Priority

Highest priority:

- New Project action
- project title
- project goal preview

Medium priority:

- storage mode
- language
- last updated

Lower priority:

- AI enabled
- section count

### 2.4 Card Style

Recommended:

- cream surface card
- bold display title
- colored top border or soft accent corner
- quiet metadata row

## 3. Setup Screen Composition

### 3.1 Purpose

This screen should feel like project framing, not like the main creative workspace.

### 3.2 Composition

```text
+--------------------------------------------------------------------------------------------------+
| Top Bar: back | project title | save state | continue to builder                                |
+--------------------------------------------------------------------------------------------------+
| Main Column                                                | Summary Sidebar                     |
|------------------------------------------------------------|-------------------------------------|
| Project Title                                              | project status                      |
| Global Purpose                                             | language                            |
| Context                                                    | sections count                      |
| Target Audience                                            | day groups count                    |
| Participant Count                                          | AI enabled                          |
| Format                                                     |                                     |
| Project Language                                           |                                     |
| AI Toggle                                                  |                                     |
|------------------------------------------------------------|-------------------------------------|
| Optional Day Groups                                                                              |
| Sections list                                                                                     |
| [Add Section] [Add Day Group]                                                                    |
+--------------------------------------------------------------------------------------------------+
```

### 3.3 Recommended Width Split

- main column: about 68%
- summary sidebar: about 32%

### 3.4 Visual Tone

- cleaner and calmer than builder
- stronger form hierarchy
- summary sidebar slightly denser

## 4. Builder Screen Composition

### 4.1 Purpose

This is the flagship screen and defines the identity of the product.

The builder must make the workshop readable as a system of:

- global goal
- sections
- linear chains
- transitions

### 4.2 Desktop Layout

```text
+--------------------------------------------------------------------------------------------------------------------+
| Top Bar                                                                                                            |
| Projects | project title | purpose summary | language | AI state | save state | Preview | Export                |
+--------------------------------------------------------------------------------------------------------------------+
| Library Pane                    | Canvas Workspace                                              | Inspector Pane   |
|---------------------------------|---------------------------------------------------------------|------------------|
| search                          | workshop header                                                | selected item     |
| filters                         |---------------------------------------------------------------| details           |
| cards                           | optional day group                                             | review            |
|                                 |   section box                                                  | notes             |
|                                 |   section box                                                  | metadata          |
|                                 | optional day group                                             |                  |
|                                 |   section box                                                  |                  |
+--------------------------------------------------------------------------------------------------------------------+
```

### 4.3 Recommended Width Split

At 1440px width:

- library pane: 280 to 320px
- inspector pane: 320 to 380px
- canvas: remaining width, ideally at least 680px

At 1280px width:

- library pane: 260px
- inspector pane: 320px
- canvas: remaining width

### 4.4 Top Bar Composition

Recommended grouping:

- left: project navigation
- center: project title and purpose summary
- right: language, AI state, save state, preview, export

The top bar should not be tall. It should feel compact and always available.

### 4.5 Canvas Header

The top of the canvas should contain:

- global purpose
- concise workshop context summary
- add section action
- review workshop action

This keeps the global framing visible while designing local chains.

### 4.6 Day Group Composition

When day groups are used:

- render them as labeled bands with subtle background distinction
- keep them visually quieter than section boxes

Suggested format:

```text
Day 1
[Section Box]
[Section Box]
```

### 4.7 Section Box Composition

```text
+--------------------------------------------------------------------------------------------------+
| Section Header                                                                                   |
| title                          sub-goal                                                          |
| time field                     total duration                    [Review] [Duplicate] [Delete]   |
+--------------------------------------------------------------------------------------------------+
| [Block Card] [Transition Card] [Block Card] [Transition Card] [Block Card]                      |
+--------------------------------------------------------------------------------------------------+
| Optional inline add affordance                                                                   |
+--------------------------------------------------------------------------------------------------+
```

### 4.8 Section Visual Hierarchy

The section should be strong enough to anchor attention even when many sections exist.

Recommended treatment:

- tinted header strip
- warm body surface
- stronger border than surrounding canvas
- moderate shadow

### 4.9 Block Card Composition

```text
+-------------------------------------------+
| icon   block title                        |
| duration          badges                  |
| invitation preview or editor              |
| metadata/status row                       |
+-------------------------------------------+
```

Recommended card width:

- 240 to 280px

Recommended height behavior:

- auto height
- compact by default
- expands when editing invitation

### 4.10 Transition Card Composition

```text
+------------------------------+
| transition note preview      |
| optional duration            |
+------------------------------+
```

Recommended width:

- 140 to 180px

Recommended visual distinction:

- lower emphasis than block cards
- more connector-like

### 4.11 Inspector Composition

The inspector should behave like a contextual workbench.

Structure:

- sticky item header
- mode-specific content sections
- review area near top
- notes and details below

Suggested internal structure:

```text
+----------------------------------+
| selected item title              |
| badges                           |
+----------------------------------+
| Review Summary                   |
+----------------------------------+
| Main Details                     |
+----------------------------------+
| Notes                            |
+----------------------------------+
| Metadata / LS Steps              |
+----------------------------------+
```

## 5. Manual Preview Screen Composition

### 5.1 Purpose

This screen should feel much more like a document than a tool.

### 5.2 Layout

```text
+--------------------------------------------------------------------------------------------------+
| Top Bar: Back to Builder | Manual Preview | Export Markdown | Export HTML | Export PDF          |
+--------------------------------------------------------------------------------------------------+
| Warning Summary                                                                                  |
+--------------------------------------------------------------------------------------------------+
| Document Column                                                                                  |
| workshop title                                                                                   |
| global purpose                                                                                   |
| context                                                                                          |
| day group                                                                                        |
|   section                                                                                        |
|     block                                                                                        |
|     transition                                                                                   |
|     block                                                                                        |
| section notes                                                                                    |
+--------------------------------------------------------------------------------------------------+
```

### 5.3 Width Strategy

- document column max width: 860 to 920px
- centered on page
- generous top and bottom spacing

### 5.4 Visual Tone

- typographically rich
- low UI chrome
- easy to print

## 6. Export Dialog Composition

### 6.1 Dialog Structure

```text
+--------------------------------------------------------+
| Export Manual                                          |
+--------------------------------------------------------+
| Format                                                 |
| ( ) Markdown                                           |
| ( ) Printable HTML                                     |
| ( ) PDF                                                |
| ( ) Project Bundle                                     |
+--------------------------------------------------------+
| Language                                               |
| [English v]                                            |
+--------------------------------------------------------+
| Options                                                |
| [ ] Include review summary                             |
| [ ] Include empty note placeholders                    |
+--------------------------------------------------------+
| [Cancel] [Export]                                      |
+--------------------------------------------------------+
```

## 7. Empty, Sparse, and Long-State Guidance

### 7.1 Empty Builder

The first section should already exist and feel inviting rather than broken.

Recommended cues:

- placeholder chain area
- short hint text
- add first block CTA

### 7.2 Sparse Project

If only one section exists:

- canvas should still feel balanced
- avoid too much empty white space

### 7.3 Long Workshop

For many sections:

- maintain generous vertical rhythm
- consider collapsible section details later
- keep header and inspector sticky

## 8. Suggested Component Sizing

### 8.1 Top Bar

- height: 64 to 72px

### 8.2 Library Pane

- card gap: 12 to 16px
- pane padding: 20 to 24px

### 8.3 Section Box

- outer padding: 20 to 24px
- header gap: 12 to 16px
- chain gap: 12 to 16px

### 8.4 Block Card

- inner padding: 14 to 18px
- title gap: 8px
- invitation area min height: 56px

### 8.5 Inspector

- width: 320 to 380px
- section spacing: 20 to 24px

## 9. Recommended Initial Figma Framing

If translated into design frames, start with:

- desktop 1440 x 1024 for Builder
- desktop 1440 x 1024 for Projects
- desktop 1280 x 960 for Setup
- desktop 1280 x 1200 for Preview

The Builder frame should be the first one explored visually.

## 10. Visual Composition Priorities

If design time is limited, prioritize polish in this order:

1. Builder screen
2. Block and section components
3. Projects screen
4. Preview screen
5. Setup screen
