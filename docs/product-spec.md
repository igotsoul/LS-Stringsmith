# LS Stringsmith

## Product and Technical Specification v0.1

### 0. Product Identity and Repository

Product name:

- `LS Stringsmith`

Repository:

- GitHub: `igotsoul/LS-Stringsmith`
- package name: `ls-stringsmith`

Short description:

- A browser-first workshop design tool for crafting purposeful Liberating Structures strings from intent to facilitation-ready flow.

Licensing:

- the LS Stringsmith source code is MIT-licensed
- third-party Liberating Structures assets and materials remain under their own licenses
- official LS icon assets are documented in `THIRD_PARTY_NOTICES.md` and are not relicensed by this project

### 1. Product Vision

LS Stringsmith is a browser-first application for facilitators and agile coaches who already know the basics of Liberating Structures and want to design workshops faster, with better structure quality and better internal facilitation documentation.

The application helps users:

- choose suitable Liberating Structures for a workshop goal and sub-goals
- chain structures into meaningful linear sequences
- define and refine invitations
- document transitions between steps
- produce an internal facilitation manual

The application is an assistive copilot, not an autopilot.

### 2. Target Users

Primary users:

- agile coaches
- facilitators
- scrum masters
- trainers and workshop designers working with Liberating Structures

User assumptions:

- users know the general Liberating Structures approach
- users may not be experts
- the product is not aimed at complete beginners

### 3. Core Problem

Designing a Liberating Structures workshop is often manual and time-consuming. Users need to:

- choose suitable structures
- determine how structures connect to one another
- create good invitations
- document the workshop flow for later facilitation

This creates avoidable effort and increases the risk of weak structure choices, poor transitions, or unclear facilitation prompts.

### 4. Product Principles

- Human in the loop: the user remains responsible for workshop design decisions.
- LS-first: the core domain is Liberating Structures, not generic whiteboarding.
- Modular: workshops are built from reusable sections and blocks.
- Practical output: the primary result is an internal facilitation plan/manual.
- Browser-first: no heavy local installation is required.
- Self-contained: self-hosting must be possible with minimal setup.
- AI-optional: the core product remains usable without AI.
- Clear licensing boundary: project source code and third-party LS materials are documented separately.

### 5. Domain Model

Workshops are modeled hierarchically, not as one giant chain.

- Workshop
  - global purpose
  - context
  - target audience
  - participant count
  - format
  - default language
  - optional day grouping
  - sections
- Day Group (optional)
  - groups sections
- Section
  - title
  - sub-goal
  - optional time field
  - notes
  - linear sequence of blocks
- Block
  - either a Liberating Structure or a neutral workshop block
- Block Step
  - optional ordered step flow inside a Liberating Structure
  - can hold per-step sub-prompts and facilitator cues
- Transition
  - moderation note between two blocks
- AI Review
  - review result for block, section, or full workshop

### 6. Workshop Structure Rules

- every workshop must contain at least one section
- every section has a sub-goal
- every section contains a linear sequence only
- no parallel paths in MVP
- days are optional grouping only
- section duration is calculated from block durations and transition durations
- all durations can be manually overridden
- library definitions remain unchanged; project instances are editable

### 7. Block Types

Supported in MVP:

- Liberating Structure
- neutral block: intro/context
- neutral block: input
- neutral block: reflection
- neutral block: break

### 8. Liberating Structure Metadata

Required fields for each LS definition:

- name
- short description
- typical purpose / intended use
- suitable situations
- expected output
- required input
- group size
- duration
- remote / onsite / hybrid support
- complexity
- typical flow position
- related or alternative structures
- risks or prerequisites

Additional classification:

- source status badge
  - official
  - unofficial
  - in development
- Matchmaker category
  - Share
  - Reveal
  - Analyze
  - Strategize
  - Help
  - Plan
  - labels localize to the active app language

### 9. AI Role

AI supports, evaluates, and suggests. It does not design the workshop autonomously.

AI can:

- review structure fit for a section goal
- review a section sequence
- review a full workshop against the global purpose
- improve invitations
- identify weak transitions
- suggest alternatives

AI cannot:

- replace the user's design responsibility
- create hidden changes automatically
- be a hard requirement for using the app

Review dimensions:

- purpose fit
- transition fit
- invitation quality

Review output:

- traffic light status
- short score label
- explanatory text
- concrete alternatives where appropriate

### 10. MVP Scope

Included:

- project creation, editing, saving
- global workshop goal and context
- section creation with sub-goals
- optional day grouping
- LS library with visual cards and standard LS icon reference
- search and filters
- drag and drop linear block chains
- neutral workshop blocks
- editable invitations directly in the builder
- transition cards between blocks
- automatic section duration calculation
- AI review on block, section, and workshop level
- markdown export
- printable HTML and PDF output
- guest mode with local browser persistence
- account mode with persisted projects
- local project bundle import/export

Excluded from MVP:

- parallel workshop flows
- real-time collaboration
- community template marketplace
- full workshop auto-generation
- complex role and permission management

### 11. Screen Model

#### 11.1 Projects

Purpose:

- list projects
- create a project
- import a local project bundle
- distinguish local and persisted projects

#### 11.2 Workshop Setup

Purpose:

- define global purpose and workshop metadata
- create initial sections
- optionally define day grouping
- highlight where deeper facilitation preparation is likely needed before detailed builder work begins

#### 11.3 Workshop Builder

The main work area with three fixed regions:

- Library Pane
- Builder Canvas
- Inspector Pane

#### 11.4 Manual Preview

Purpose:

- generate an internal facilitation manual on demand
- review structure, content, and completeness before export
- read like a facilitation run sheet, not only like export formatting
- scale detail according to structure complexity, showing deeper step flow where choreography matters

#### 11.5 Export

Purpose:

- export markdown
- export printable HTML
- export PDF
- export a portable project bundle

### 12. Builder UI Component Specification

#### 12.1 App Shell

Responsibilities:

- top navigation
- project title/status
- language switcher
- storage/runtime capability indicators
- project-level AI toggle
- access to preview/export

Key states:

- guest mode
- account mode
- AI available / unavailable
- unsaved changes

#### 12.2 Library Pane

Responsibilities:

- search definitions
- filter by flow position, format, duration, group size, input, output, source status
- filter by Matchmaker category
- show LS cards with icon, name, short description, duration, badge
- insert LS or neutral blocks into the selected section
- support deeper inspection of the selected library entry in the shared inspector
- surface related and alternative structures without leaving the builder

Key UI elements:

- search input
- compact filter trigger with contextual popover/menu
- result list/grid
- card-level quick info
- compact recommendation surface for the active section
- library-detail mode in inspector with `Use in this section`
- related structure links
- alternative structure links

#### 12.3 Builder Canvas

Responsibilities:

- visualize the workshop as a sequence of sections
- optionally group sections under days
- support drag and drop ordering
- keep flow legible at all times

Structure:

- Workshop Canvas
  - Day Group (optional)
    - Section Box
      - Section Header
      - Block Row
        - Block Card
        - Transition Card

#### 12.4 Section Box

Responsibilities:

- display section title and sub-goal
- show optional time field
- show calculated total duration
- contain a linear chain of blocks
- allow section duplication, deletion, and movement

Section header fields:

- title
- sub-goal
- optional time field
- section notes indicator
- total duration

Section actions:

- duplicate
- move
- delete
- AI review section

#### 12.5 Block Card

Responsibilities:

- show compact information for one block instance
- make invitation visible and editable directly in the builder
- allow duration override
- open deep details in inspector

Visible card fields:

- icon
- block name
- duration
- invitation preview/editor
- optional warning line when the block needs attention
- selection state

Invitation behavior:

- non-selected blocks show a compact invitation preview
- the selected block reveals the full inline editor
- full detailed editing still available in inspector

#### 12.6 Transition Card

Responsibilities:

- document how the facilitator transitions from one block to the next
- store transition note
- store optional transition duration
- support AI-aware sequence reviews

Visible fields:

- short transition label or note preview
- optional duration
- status indicator

#### 12.7 Inspector Pane

Responsibilities:

- edit details for selected section, block, or transition
- show LS steps for a selected LS block
- show metadata and risks
- support longer-form notes editing
- host the LS-internal step editor without overloading the block card

Design rule:

- LS-internal step editing belongs in the inspector, not in overflow/context menus
- context menus are for actions, not for deep facilitation content

Inspector modes:

- section mode
- block mode
- transition mode

Block mode fields:

- full name
- source badge
- full description
- LS steps
- expandable structure flow section
  - ordered LS steps
  - per-step sub-prompt
  - per-step facilitator cue
  - optional harvest step without a participant-facing prompt
- invitation editor
- facilitator notes
- input notes
- output notes
- duration editor
- risks/prerequisites
- AI actions

#### 12.8 AI Action Entry Points

AI must be on-demand and visible, not always intrusive.

Entry points:

- on block card: review block / improve invitation
- on section box: review section
- on project level: review workshop

Review display:

- inline summary badge where helpful
- detailed explanation in inspector or review panel

#### 12.9 Manual Preview View

Responsibilities:

- render a structured facilitation manual
- show warnings for incomplete content
- enable export actions
- surface workshop-level review guidance without turning the preview into a diagnostic dashboard
- include step-level facilitation detail only where it adds practical run-time value
- provide a dedicated print-safe and PDF-safe rendering of the same manual

Preview sections:

- workshop header
- context
- workshop review summary
- day groups
- sections
- block details
- transition notes
- optional detailed structure flow and facilitator cues for higher-complexity structures
- optional print-only preface with workshop metadata and final prep notes

Preview review rule:

- preview should show workshop-level review only
- section-level reviews belong in the builder, where they help design decisions
- preview should stay focused on facilitation flow rather than repeated section diagnostics

Print/PDF behavior:

- preview includes a direct `Print / Save PDF` action
- printable rendering hides surrounding application chrome
- PDF is derived from the same print-oriented manual view
- printable rendering may include a compact print-only preface with workshop metadata and outstanding prep notes
- new day groups may begin on a fresh page in the printable view

### 13. User Flows

#### 13.1 Guest Flow

1. Open app in browser
2. Start without login
3. Create workshop project
4. Build workshop locally
5. Export manual and/or project bundle
6. Optionally claim project into an account later

#### 13.2 Persisted Account Flow

1. Open app
2. Login via magic link
3. Create or open project
4. Build and save project
5. Export or preview
6. Return later and continue

#### 13.3 Section Design Flow

1. Select or create section
2. Define section sub-goal
3. Drag LS or neutral blocks into the chain
4. Reorder blocks
5. Add invitations
6. Add transition notes
7. Adjust durations and notes
8. Run section review if needed

#### 13.4 Manual Generation Flow

1. From builder, click preview/manual action
2. Generate manual view from current project model
3. Review structure and warnings
4. Export in chosen format

### 14. Action and API Specification

Actions are defined in a transport-neutral way so they can work with local guest storage and server persistence.

#### 14.1 Project Actions

- createProject(payload)
- listProjects()
- getProject(projectId)
- updateProjectMeta(projectId, payload)
- duplicateProject(projectId)
- deleteProject(projectId)
- claimGuestProject(projectBundle)

#### 14.2 Day and Section Actions

- addDay(projectId, payload)
- reorderDays(projectId, orderedIds)
- addSection(projectId, payload)
- updateSection(sectionId, payload)
- duplicateSection(sectionId)
- moveSection(sectionId, targetIndex, optionalDayId)
- deleteSection(sectionId)

#### 14.3 Builder Actions

- addBlock(sectionId, definitionOrNeutralType, targetIndex)
- moveBlock(blockInstanceId, targetIndex)
- removeBlock(blockInstanceId)
- updateBlock(blockInstanceId, payload)
- updateTransition(transitionId, payload)
- recalculateSectionDuration(sectionId)
- validateSection(sectionId)

#### 14.4 Library Actions

- searchDefinitions(query, filters)
- getDefinition(definitionId, language)
- listRelatedDefinitions(definitionId)
- listFilterFacets()

#### 14.5 AI Actions

- reviewBlock(blockInstanceId)
- reviewSection(sectionId)
- reviewProject(projectId)
- improveInvitation(blockInstanceId, promptStyle)
- suggestAlternatives(scopeType, scopeId)
- toggleProjectAI(projectId, enabled)

#### 14.6 Export and Bundle Actions

- generateManualPreview(projectId, language)
- exportMarkdown(projectId, language)
- exportPrintableHtml(projectId, language)
- exportPdf(projectId, language)
- exportProjectBundle(projectId)
- importProjectBundle(file)

#### 14.7 Runtime and Auth Actions

- requestMagicLink(email)
- getRuntimeCapabilities()
- getCurrentStorageMode()

### 15. Data Model

#### 15.1 Core Entities

- User
- WorkshopProject
- WorkshopDay
- WorkshopSection
- BlockDefinition
- BlockDefinitionContent
- BlockDefinitionRelation
- BlockInstance
- Transition
- AIReview
- AIReviewAlternative
- ExportArtifact

#### 15.2 Key Field Outline

User:

- id
- email
- display_name
- preferred_language
- created_at
- last_login_at

WorkshopProject:

- id
- owner_user_id
- title
- global_purpose
- context
- target_audience
- participant_count
- format
- default_language
- ai_enabled
- created_at
- updated_at

WorkshopDay:

- id
- project_id
- title
- order_index
- optional_date_label

WorkshopSection:

- id
- project_id
- day_id
- title
- subgoal
- optional_timebox
- notes
- order_index

BlockDefinition:

- id
- kind
- slug
- source_status
- default_duration_minutes
- format_support
- complexity
- flow_positions
- icon_ref
- active

BlockDefinitionContent:

- id
- definition_id
- language
- name
- short_description
- typical_purpose
- situations
- expected_output
- required_input
- risks_or_prerequisites

BlockDefinitionRelation:

- id
- definition_id
- related_definition_id
- relation_type

BlockDefinitionStep:

- id
- definition_id
- order_index
- title
- step_role
- default_prompt
- default_facilitator_cue

BlockInstance:

- id
- section_id
- definition_id
- order_index
- custom_title
- duration_minutes
- duration_mode
- invitation_text
- facilitator_notes
- input_notes
- output_notes

BlockInstanceStep:

- id
- block_instance_id
- definition_step_id
- order_index
- title
- step_role
- prompt_text
- facilitator_cue

Transition:

- id
- section_id
- from_block_instance_id
- to_block_instance_id
- transition_note
- duration_minutes

AIReview:

- id
- project_id
- scope_type
- scope_id
- language
- status
- score_label
- purpose_fit_comment
- transition_fit_comment
- invitation_quality_comment
- improvement_suggestions
- created_at

AIReviewAlternative:

- id
- review_id
- suggested_definition_id
- reason

ExportArtifact:

- id
- project_id
- format
- language
- created_at
- version

#### 15.3 Supporting Runtime Entities

- AuthSession
- ProjectStorageMode
- AIConfiguration
- ProjectBundle

### 16. Storage and Runtime Modes

#### 16.1 Guest Mode

- no login required
- projects stored in IndexedDB
- export/import available
- no automatic cloud sync

#### 16.2 Workspace Draft Mode

- no login required yet
- browser-persisted runtime target separate from guest local mode
- prepares the later account-backed persisted project flow
- current project can be switched into this mode without changing builder behavior

#### 16.3 Server Draft Mode

- no login required yet
- saves through the running app instance instead of browser-only persistence
- uses a lightweight server adapter as the seam for later account-backed persistence
- makes persisted-mode behavior testable before auth is introduced

#### 16.4 Persisted Mode

- same UI and domain logic
- projects stored in SQLite through app server
- account-based loading and saving

#### 16.5 AI Enabled Mode

- optional
- hosted mode uses platform-managed key
- self-hosted mode uses deployment-managed key
- future BYO key possible, not required for MVP

### 17. Technical Architecture

The preferred architecture is a self-contained browser-first modular monolith.

#### 17.1 Architecture Principles

- single codebase
- single deployable web application
- SQLite by default
- IndexedDB for guest mode
- Docker-friendly self-hosting
- optional integrations only
- no required external DB
- no required AI setup
- no required SMTP setup in guest or self-host-lite mode

#### 17.2 Recommended Stack

- Next.js
- React
- TypeScript
- dnd-kit
- SQLite
- Prisma or Drizzle
- IndexedDB for local guest projects

#### 17.3 Internal Technical Modules

- app shell
- projects
- setup
- builder
- library
- review
- export
- auth
- storage
- domain
- i18n
- server

#### 17.4 Deployment Modes

Hosted mode:

- browser app + app server
- SQLite or future replaceable DB
- magic link
- optional AI

Self-hosted mode:

- single container or single process preferred
- SQLite file storage
- optional SMTP
- optional AI key

Guest-only mode:

- local builder experience
- browser storage only
- import/export based portability

### 18. Security and Privacy Requirements

- privacy by design
- secure defaults
- secrets only on server side
- TLS in hosted environments
- secure cookies and sessions
- no automatic cloud sync in guest mode
- explicit AI enablement per project
- transparent AI usage
- no training on customer data
- deletion and retention policy must be definable
- EU-hosting readiness is required
- self-hosting must remain possible

### 19. Internationalization Requirements

- primary application language: English
- German must be supported across:
  - UI
  - LS content
  - AI outputs
  - exports
- project language should act as first-class configuration
- LS library content should support language-specific records

### 20. Export and Bundle Model

#### 20.1 Project Bundle

Portable project file for local backup, transfer, and migration.

Bundle fields:

- schema_version
- project_meta
- days
- sections
- block_instances
- transitions
- project_language
- exported_at
- app_capabilities_snapshot

#### 20.2 Manual DTO

Canonical representation used for all manual outputs.

- project_header
- workshop_context
- day_groups
- sections
- block_entries
- transition_entries
- review_summary
- appendix

Outputs derived from the same DTO:

- markdown
- printable HTML
- PDF

### 21. Non-Functional Requirements

- browser-first
- desktop-prioritized
- local-first capable
- offline-friendly guest mode
- low-config self-hosting
- single-deployable
- AI optional
- self-contained by default
- secure by default
- i18n-ready
- maintainable shared domain logic between guest and persisted modes

### 22. Delivery Plan

#### 22.1 Slice 1: Core Local Builder

Scope:

- workshop model
- sections
- block chains
- transitions
- builder UI shell
- IndexedDB guest persistence

Success:

- a guest user can create, edit, and reload a local workshop in the same browser

#### 22.2 Slice 2: Library and Inspector

Scope:

- LS definition library
- filters
- block details
- inspector editing

Success:

- a user can browse LS content and build a meaningful section flow

#### 22.3 Slice 3: Manual and Bundle Export

Scope:

- manual preview
- markdown export
- printable HTML/PDF
- project bundle export/import

Success:

- a user can produce a usable facilitation manual and move projects across environments

#### 22.4 Slice 4: Persisted Mode

Scope:

- SQLite-backed storage
- project list
- account ownership
- claiming guest projects

Success:

- a logged-in user can persist and reopen projects

#### 22.5 Slice 5: Auth

Scope:

- magic link hosted mode
- optional self-hosted auth configuration

Success:

- hosted users can authenticate with low friction

#### 22.6 Slice 6: AI Layer

Scope:

- invitation improvement
- block review
- section review
- workshop review
- alternative suggestions

Success:

- AI reviews provide useful assistive value without being required for core product usage

#### 22.7 Slice 7: Self-Hosting Polish

Scope:

- Docker packaging
- setup docs
- environment defaults
- runtime capability checks

Success:

- a technically capable user can run the app from GitHub with minimal setup

### 23. Implementation Backlog

#### Epic 1: Project Foundations

Story 1.1: Create a new workshop project

Acceptance criteria:

- user can create a project with title and global purpose
- at least one section is created automatically
- project is stored according to active storage mode

Story 1.2: Edit workshop metadata

Acceptance criteria:

- user can edit context, audience, participant count, format, and language
- changes are persisted and reflected in preview/export

#### Epic 2: Sections and Flow

Story 2.1: Add, edit, move, and delete sections

Acceptance criteria:

- user can create multiple sections
- user can reorder sections
- user can optionally assign sections to day groups

Story 2.2: Duplicate a section

Acceptance criteria:

- duplicated section includes block chain and transitions
- duplicated section gets a new identifier
- duplication preserves editable project content only

#### Epic 3: Builder Blocks

Story 3.1: Add LS blocks from library

Acceptance criteria:

- user can add an LS into a selected section
- block uses library defaults on creation
- project instance remains editable without changing the library definition

Story 3.2: Add neutral blocks

Acceptance criteria:

- user can add intro/context, input, reflection, and break blocks
- neutral blocks behave like normal block instances in the chain

Story 3.3: Reorder blocks in a section

Acceptance criteria:

- user can move blocks within the section
- chain remains linear
- transitions are preserved or recreated consistently

#### Epic 4: Invitations and Transitions

Story 4.1: Edit invitation directly on the block card

Acceptance criteria:

- invitation is visible on the card
- invitation can be edited inline
- long text can be expanded

Story 4.2: Maintain transition notes

Acceptance criteria:

- transition card exists between adjacent blocks
- transition note can be edited
- optional transition duration is supported

#### Epic 5: Library Experience

Story 5.1: Search and filter LS definitions

Acceptance criteria:

- search works on name and relevant content
- filters include flow position, format, source status, input, and output
- result cards show icon, name, duration, and badge

Story 5.2: Inspect LS details

Acceptance criteria:

- user can open full LS metadata and steps
- related and alternative LS are visible

#### Epic 6: Duration and Validation

Story 6.1: Automatic section duration calculation

Acceptance criteria:

- section duration sums block and transition durations
- duration updates after edits and reordering

Story 6.2: Manual duration overrides

Acceptance criteria:

- user can override default duration on block and transition level
- calculated section total reflects overrides

Story 6.3: Section validation

Acceptance criteria:

- builder can detect missing required data
- warnings are visible before export

#### Epic 7: Manual and Export

Story 7.1: Generate manual preview

Acceptance criteria:

- user can trigger preview on demand
- preview shows workshop context, sections, blocks, and transitions
- incomplete data is signaled via warnings

Story 7.2: Export markdown

Acceptance criteria:

- export includes structured metadata header
- export is detailed and suitable for downstream processing

Story 7.3: Export printable HTML/PDF

Acceptance criteria:

- printable view uses same manual source model
- PDF is derived from printable HTML

Story 7.4: Export and import project bundles

Acceptance criteria:

- bundle includes full project structure
- imported bundle restores sections, blocks, transitions, and metadata
- import flow shows schema compatibility, export metadata, and explicit confirmation before replacing the current draft

#### Epic 8: Guest and Persisted Storage

Story 8.1: Guest mode local persistence

Acceptance criteria:

- projects survive browser reloads in the same browser
- projects never sync remotely without explicit user action
- guest mode remains fast and no-login

Story 8.2: Workspace draft runtime mode

Acceptance criteria:

- user can switch between guest local and workspace draft
- each mode writes to a separate browser storage namespace
- the current project keeps working seamlessly after a mode switch

Story 8.3: Server draft runtime mode

Acceptance criteria:

- user can switch into a server-backed draft mode without auth
- project saves through a SQLite-backed server adapter rather than browser storage alone
- the same project document shape is preserved across browser and server draft modes

Story 8.4: Persisted project storage

Acceptance criteria:

- logged-in user can save and reopen projects
- guest projects can be claimed into an account

#### Epic 9: Authentication

Story 9.1: Magic link login for hosted mode

Acceptance criteria:

- user can request and use a magic link
- login state is maintained securely
- server draft mode can use a lightweight local hosted-style magic-link flow before the final hosted auth stack exists
- auth identity and project ownership remain separate concepts in the UI and data model

Story 9.2: Runtime capability fallback

Acceptance criteria:

- app behaves correctly if auth is disabled
- guest mode remains fully usable
- storage and AI capability state are communicated clearly in the shell

#### Epic 10: AI Assistance

Story 10.1: Toggle AI per project

Acceptance criteria:

- user can enable or disable AI for a project
- when disabled, AI actions are unavailable but core product still works
- preview hides workshop review when AI is disabled
- markdown export omits review summaries when AI is disabled
- top bar offers a project-level AI toggle, not only setup

Story 10.2: Review a block

Acceptance criteria:

- review returns traffic light, score label, and explanation
- review considers section goal and invitation

Story 10.3: Review a section

Acceptance criteria:

- review considers sequence quality and transitions
- alternatives can be suggested

Story 10.4: Review a workshop

Acceptance criteria:

- review considers global purpose and section-level coherence

Story 10.5: Improve an invitation

Acceptance criteria:

- user can request a rewritten or sharpened invitation
- original invitation is not silently replaced

#### Epic 11: Self-Hosting and Packaging

Story 11.1: Single-container deployment

Acceptance criteria:

- app can run with one primary container or process
- SQLite persistence is supported via mounted volume

Story 11.2: Minimal configuration setup

Acceptance criteria:

- default setup works without external DB
- AI and SMTP remain optional integrations

### 24. Risks and Watchouts

- builder UX can become cluttered if cards carry too much information
- LS library quality will strongly determine AI usefulness
- invitation editing in-card must remain lightweight
- bundle versioning must be planned early to avoid migration pain
- self-hosting simplicity can conflict with advanced auth and email features
- PDF generation should not become a separate rendering system

### 25. Decision Log

Key decisions already made:

- browser-first application
- self-contained architecture preferred
- single-user first
- AI assistive only
- official and unofficial LS supported
- linearly chained blocks only
- workshop hierarchy: global goal -> sections -> local chains
- English-first application with German support
- markdown plus printable HTML/PDF export
- local browser storage in guest mode
- SQLite as default persisted storage for self-contained deployment
- product and repo identity: LS Stringsmith / `igotsoul/LS-Stringsmith`
- source code under MIT
- third-party Liberating Structures assets remain under their own licenses

### 26. Next Recommended Outputs

The next artifacts to produce are:

- wireframe-level screen specification
- data schema draft for implementation
- technical spike decisions for drag-and-drop, export rendering, and local persistence
- initial repo scaffold and architecture skeleton
