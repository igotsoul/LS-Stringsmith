# Liberating Structure Designer

## Data Schema Draft v0.1

This document translates the product data model into an implementation-oriented schema draft for a SQLite-first application with a future upgrade path to PostgreSQL.

The schema is intentionally relational and conservative to support:

- self-contained deployment
- deterministic workshop ordering
- local/project bundle portability
- optional future collaboration

## 1. Schema Conventions

- primary keys use string IDs
- timestamps use ISO datetime storage or ORM-native datetime types
- ordering is explicit through `order_index`
- language-specific LS content is stored separately from structural definitions
- project content is instance-based and does not mutate library definitions

## 2. Enumerations

### 2.1 ProjectFormat

- `remote`
- `onsite`
- `hybrid`

### 2.2 BlockKind

- `ls`
- `neutral`

### 2.3 NeutralBlockType

- `intro_context`
- `input`
- `reflection`
- `break`

### 2.4 SourceStatus

- `official`
- `unofficial`
- `in_development`

### 2.5 FlowPosition

- `opening`
- `exploration`
- `sense_making`
- `prioritization`
- `decision`
- `reflection`
- `closing`

### 2.6 FormatSupport

- `remote`
- `onsite`
- `hybrid`

### 2.7 ComplexityLevel

- `low`
- `medium`
- `high`

### 2.8 DurationMode

- `default`
- `override`

### 2.9 ReviewScopeType

- `block`
- `section`
- `workshop`

### 2.10 ReviewStatus

- `red`
- `yellow`
- `green`

### 2.11 RelationType

- `related`
- `alternative`
- `good_followup`

### 2.12 ExportFormat

- `markdown`
- `html`
- `pdf`
- `bundle`

### 2.13 MatchmakerCategory

- `share`
- `reveal`
- `analyze`
- `strategize`
- `help`
- `plan`

## 3. Core Tables

### 3.1 users

| column | type | required | notes |
|---|---|---:|---|
| id | string | yes | primary key |
| email | string | yes | unique |
| display_name | string | no | |
| preferred_language | string | no | `en` default |
| created_at | datetime | yes | |
| last_login_at | datetime | no | |

Indexes:

- unique on `email`

### 3.2 workshop_projects

| column | type | required | notes |
|---|---|---:|---|
| id | string | yes | primary key |
| owner_user_id | string | no | nullable for guest-imported records before claim |
| title | string | yes | |
| global_purpose | text | yes | |
| context | text | no | |
| target_audience | text | no | |
| participant_count | integer | no | |
| format | enum(ProjectFormat) | no | |
| default_language | string | yes | `en` or `de` initially |
| ai_enabled | boolean | yes | default false |
| created_at | datetime | yes | |
| updated_at | datetime | yes | |

Indexes:

- index on `owner_user_id`
- index on `updated_at`

### 3.3 workshop_days

| column | type | required | notes |
|---|---|---:|---|
| id | string | yes | primary key |
| project_id | string | yes | foreign key to workshop_projects |
| title | string | yes | e.g. Day 1 |
| optional_date_label | string | no | free text or formatted date |
| order_index | integer | yes | deterministic order |
| created_at | datetime | yes | |
| updated_at | datetime | yes | |

Indexes:

- composite index on `project_id, order_index`

### 3.4 workshop_sections

| column | type | required | notes |
|---|---|---:|---|
| id | string | yes | primary key |
| project_id | string | yes | foreign key to workshop_projects |
| day_id | string | no | nullable foreign key to workshop_days |
| title | string | yes | can start as generated placeholder |
| subgoal | text | yes | |
| optional_timebox | string | no | free text in MVP |
| notes | text | no | section notes |
| order_index | integer | yes | order within project or day scope |
| created_at | datetime | yes | |
| updated_at | datetime | yes | |

Indexes:

- composite index on `project_id, order_index`
- index on `day_id`

### 3.5 block_definitions

| column | type | required | notes |
|---|---|---:|---|
| id | string | yes | primary key |
| kind | enum(BlockKind) | yes | |
| neutral_block_type | enum(NeutralBlockType) | no | only for neutral definitions |
| slug | string | yes | unique |
| source_status | enum(SourceStatus) | no | mainly relevant for LS |
| default_duration_minutes | integer | no | |
| complexity | enum(ComplexityLevel) | no | |
| icon_ref | string | no | icon key or asset reference |
| active | boolean | yes | default true |
| created_at | datetime | yes | |
| updated_at | datetime | yes | |

Indexes:

- unique on `slug`
- index on `kind`
- index on `source_status`

### 3.6 block_definition_contents

| column | type | required | notes |
|---|---|---:|---|
| id | string | yes | primary key |
| definition_id | string | yes | foreign key to block_definitions |
| language | string | yes | e.g. `en`, `de` |
| name | string | yes | localized |
| short_description | text | yes | localized |
| typical_purpose | text | no | localized |
| suitable_situations | text | no | localized |
| expected_output | text | no | localized |
| required_input | text | no | localized |
| risks_or_prerequisites | text | no | localized |
| steps_markdown | text | no | optional rich text fallback for imported LS step descriptions |
| created_at | datetime | yes | |
| updated_at | datetime | yes | |

Indexes:

- unique on `definition_id, language`
- index on `language`

### 3.7 block_definition_flow_positions

Join table for many-to-many flow positions.

| column | type | required | notes |
|---|---|---:|---|
| definition_id | string | yes | foreign key |
| flow_position | enum(FlowPosition) | yes | |

Primary key:

- `definition_id, flow_position`

### 3.8 block_definition_format_support

Join table for many-to-many format support.

| column | type | required | notes |
|---|---|---:|---|
| definition_id | string | yes | foreign key |
| format_support | enum(FormatSupport) | yes | |

Primary key:

- `definition_id, format_support`

### 3.9 block_definition_relations

| column | type | required | notes |
|---|---|---:|---|
| id | string | yes | primary key |
| definition_id | string | yes | source definition |
| related_definition_id | string | yes | target definition |
| relation_type | enum(RelationType) | yes | |
| created_at | datetime | yes | |

Indexes:

- composite index on `definition_id, relation_type`

### 3.10 definition_input_tags

Normalized tags for filterability.

| column | type | required | notes |
|---|---|---:|---|
| id | string | yes | primary key |
| definition_id | string | yes | foreign key |
| tag | string | yes | normalized lowercase |

Indexes:

- composite index on `definition_id, tag`
- index on `tag`

### 3.11 definition_output_tags

Normalized tags for filterability.

| column | type | required | notes |
|---|---|---:|---|
| id | string | yes | primary key |
| definition_id | string | yes | foreign key |
| tag | string | yes | normalized lowercase |

Indexes:

- composite index on `definition_id, tag`
- index on `tag`

### 3.11a block_definition_matchmaker_categories

Join table for official Matchmaker categories.

| column | type | required | notes |
|---|---|---:|---|
| definition_id | string | yes | foreign key |
| matchmaker_category | enum(MatchmakerCategory) | yes | |

Primary key:

- `definition_id, matchmaker_category`

### 3.11b block_definition_steps

Ordered template steps for Liberating Structures.

| column | type | required | notes |
|---|---|---:|---|
| id | string | yes | primary key |
| definition_id | string | yes | foreign key to block_definitions |
| order_index | integer | yes | deterministic step order |
| title | string | yes | e.g. `Solo reflection` |
| step_role | string | no | e.g. prompt moment, facilitator move, harvest |
| default_prompt | text | no | default participant-facing prompt/sub-prompt |
| default_facilitator_cue | text | no | default facilitation guidance |
| created_at | datetime | yes | |
| updated_at | datetime | yes | |

Indexes:

- composite index on `definition_id, order_index`

### 3.12 block_instances

| column | type | required | notes |
|---|---|---:|---|
| id | string | yes | primary key |
| section_id | string | yes | foreign key to workshop_sections |
| definition_id | string | yes | foreign key to block_definitions |
| order_index | integer | yes | order within section |
| custom_title | string | no | optional project-level override |
| duration_minutes | integer | no | actual effective duration |
| duration_mode | enum(DurationMode) | yes | default or override |
| invitation_text | text | no | project-specific |
| facilitator_notes | text | no | project-specific |
| input_notes | text | no | project-specific |
| output_notes | text | no | project-specific |
| created_at | datetime | yes | |
| updated_at | datetime | yes | |

Indexes:

- composite index on `section_id, order_index`
- index on `definition_id`

### 3.12a block_instance_steps

Project-level step overrides for a concrete block instance.

| column | type | required | notes |
|---|---|---:|---|
| id | string | yes | primary key |
| block_instance_id | string | yes | foreign key to block_instances |
| definition_step_id | string | no | nullable if created ad hoc from imported markdown |
| order_index | integer | yes | order within the block instance |
| title | string | yes | editable per project |
| step_role | string | no | prompt moment, facilitator move, harvest |
| prompt_text | text | no | project-specific sub-prompt |
| facilitator_cue | text | no | project-specific facilitator note for this step |
| created_at | datetime | yes | |
| updated_at | datetime | yes | |

Indexes:

- composite index on `block_instance_id, order_index`
- index on `definition_step_id`

### 3.13 transitions

| column | type | required | notes |
|---|---|---:|---|
| id | string | yes | primary key |
| section_id | string | yes | foreign key to workshop_sections |
| from_block_instance_id | string | yes | foreign key to block_instances |
| to_block_instance_id | string | yes | foreign key to block_instances |
| transition_note | text | no | |
| duration_minutes | integer | no | optional transition duration |
| created_at | datetime | yes | |
| updated_at | datetime | yes | |

Indexes:

- unique on `from_block_instance_id, to_block_instance_id`
- index on `section_id`

### 3.14 ai_reviews

| column | type | required | notes |
|---|---|---:|---|
| id | string | yes | primary key |
| project_id | string | yes | foreign key to workshop_projects |
| scope_type | enum(ReviewScopeType) | yes | |
| scope_id | string | yes | block, section, or project id |
| language | string | yes | review language |
| status | enum(ReviewStatus) | yes | |
| score_label | string | no | human-readable score summary |
| purpose_fit_comment | text | no | |
| transition_fit_comment | text | no | |
| invitation_quality_comment | text | no | |
| improvement_suggestions | text | no | markdown or structured json later |
| raw_payload_json | text | no | optional trace/debug field |
| created_at | datetime | yes | |

Indexes:

- composite index on `project_id, scope_type, scope_id`
- index on `created_at`

### 3.15 ai_review_alternatives

| column | type | required | notes |
|---|---|---:|---|
| id | string | yes | primary key |
| review_id | string | yes | foreign key to ai_reviews |
| suggested_definition_id | string | yes | foreign key to block_definitions |
| reason | text | no | |
| created_at | datetime | yes | |

Indexes:

- index on `review_id`

### 3.16 export_artifacts

| column | type | required | notes |
|---|---|---:|---|
| id | string | yes | primary key |
| project_id | string | yes | foreign key |
| format | enum(ExportFormat) | yes | |
| language | string | yes | |
| version | string | no | export schema version |
| created_at | datetime | yes | |

Indexes:

- index on `project_id`
- index on `created_at`

## 4. Optional Runtime Tables

### 4.1 auth_sessions

Hosted or persisted mode only.

| column | type | required | notes |
|---|---|---:|---|
| id | string | yes | primary key |
| user_id | string | yes | foreign key to users |
| expires_at | datetime | yes | |
| created_at | datetime | yes | |

### 4.2 magic_link_tokens

| column | type | required | notes |
|---|---|---:|---|
| id | string | yes | primary key |
| email | string | yes | |
| token_hash | string | yes | |
| expires_at | datetime | yes | |
| used_at | datetime | no | |
| created_at | datetime | yes | |

Indexes:

- index on `email`
- index on `expires_at`

### 4.3 app_settings

Deployment-level configuration for self-hosted or hosted runtime.

| column | type | required | notes |
|---|---|---:|---|
| key | string | yes | primary key |
| value_json | text | yes | |
| updated_at | datetime | yes | |

## 5. Guest Mode Notes

Guest projects should use the same conceptual shape as persisted projects, but do not need to map 1:1 to SQL tables in browser storage.

Recommended browser storage structure:

- project bundle document
- indexed by project id
- includes nested sections, blocks, transitions
- bundle header should include schema version and export metadata for compatibility checks

The import/export format should be close enough to the relational schema that migration to persisted mode is straightforward.

## 6. Relational Rules

- a workshop project must have at least one section
- a section belongs to exactly one project
- a section may belong to one day group or none
- a block instance belongs to exactly one section
- a transition connects exactly two adjacent block instances in the same section
- a block instance references exactly one block definition
- a review belongs to one project and references one scope

## 7. Deletion Strategy

Suggested default:

- deleting a project cascades to days, sections, blocks, transitions, reviews, and export artifacts
- deleting a section cascades to block instances and transitions
- block definitions should not be hard deleted casually; prefer `active = false`

## 8. Suggested Future Extensions

These are intentionally not required for MVP, but the schema should not block them:

- project sharing
- multi-user collaboration
- version history
- reusable user templates
- organization or workspace ownership
- comments and annotations
- richer typed review outputs

## 9. Migration Considerations

- define a schema version for project bundle exports from the start
- avoid storing business-critical ordering only inside JSON blobs
- keep enum expansion easy for future neutral block types and review statuses
- treat language and content localization as first-class schema concerns
