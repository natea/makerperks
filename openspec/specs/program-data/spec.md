# program-data Specification

## Purpose
TBD - created by archiving change add-makerperks-directory. Update Purpose after archive.
## Requirements
### Requirement: Canonical program record
The system SHALL represent each perk program as exactly one canonical record,
stored as a single YAML file at `src/content/programs/<provider_slug>/<program>.yaml`,
validated against a JSON Schema and the Astro content-collection schema.

#### Scenario: One file per program
- **WHEN** a program is added to the directory
- **THEN** it exists as exactly one YAML file under its provider's folder
- **AND** the same program is never duplicated to represent multiple audiences

#### Scenario: Invalid record rejected in CI
- **WHEN** a program YAML file violates the schema (missing required field or bad enum)
- **THEN** CI validation fails and the change cannot be merged

### Requirement: Adopted base schema
Each program record SHALL include the cloudcredits.io base fields: `provider_slug`,
`title`, `intro`, `description`, `status`, `tags`, `url`, `value_type`, `currency`,
`min_value`, `max_value`, optional `tiers[]`, `faq[]`, `community_notes`, and `draft`.

#### Scenario: Tiered program preserves tier detail
- **WHEN** a program has multiple tiers (e.g. AWS Activate Founders vs Portfolio)
- **THEN** each tier records its own `max_value`, `eligibility`, and `steps_to_apply`

### Requirement: Persona and provenance extensions
Each program record SHALL additionally carry `audience[]`, `sources[]`, and
`verified`, and MAY carry `region`, `aggregator`, and `unlocks[]`.

#### Scenario: Multi-audience program
- **WHEN** a program serves more than one audience (e.g. Microsoft Azure for students and startups)
- **THEN** `audience` lists every applicable persona from
  `startup | student | oss | indie | ambassador | nonprofit`

#### Scenario: Provenance recorded
- **WHEN** a program is imported or ingested from one or more sources
- **THEN** `sources[]` lists each contributing source id
- **AND** `verified` is set to the source's last-updated date, never a fabricated date

#### Scenario: Region-locked program
- **WHEN** a program is restricted to a region (e.g. India-only)
- **THEN** `region` is set accordingly; absent `region` means `global`

### Requirement: Scope fence
The directory SHALL only contain builder and dev-adjacent programs and SHALL
exclude pure consumer/lifestyle discounts.

#### Scenario: On-thesis program accepted
- **WHEN** a program offers cloud, AI/ML, dev tools, SaaS, infra, security, data,
  learning, design, productivity, or hardware/CAD value
- **THEN** it is eligible for inclusion

#### Scenario: Consumer program rejected
- **WHEN** a candidate is a fashion, travel, food, banking, streaming, or therapy discount
- **THEN** it is excluded from the directory

### Requirement: Program summary line
Each program record SHALL support an optional `summary` field: a neutral, single
sentence (≤ 120 characters) stating what the software or service is or provides.
The `summary` SHALL NOT be a promotional pitch and SHALL NOT restate the dollar
value or discount already carried by `max_value` / `value_type`.

#### Scenario: Summary describes the product
- **WHEN** a program record defines `summary`
- **THEN** it reads as what the product is or does (e.g. "Managed Postgres hosting
  with branching and autoscaling")
- **AND** it contains no value figure and no pitch verb

#### Scenario: Record without summary still valid
- **WHEN** a program record omits `summary`
- **THEN** schema validation still passes
- **AND** the listing falls back to a truncated `intro`

### Requirement: Provider logo asset
Each provider SHALL be able to carry a committed logo image referenced by the
`providers` collection `logo` field, stored locally under `public/logos/` and keyed
by `provider_slug` so multi-program vendors share one logo.

#### Scenario: Logo committed and uniform
- **WHEN** a provider's logo has been acquired
- **THEN** it exists as a committed image normalized to a uniform square
- **AND** it is served from the site's own assets, not an external URL at runtime

#### Scenario: Provider without a logo
- **WHEN** no logo could be acquired for a provider
- **THEN** the record remains valid with no `logo` path
- **AND** the listing renders a neutral monogram placeholder instead of a broken image

### Requirement: Build-derived record dates
The system SHALL derive each record's `added` and `updated` dates at build time
from git history — `added` from the file's first commit and `updated` from its most
recent commit — without persisting either into the YAML record.

#### Scenario: Dates available to the listing
- **WHEN** the site is built with full git history
- **THEN** each program exposes an `added` and `updated` date to the listing

#### Scenario: History unavailable
- **WHEN** git history is absent (e.g. a shallow clone)
- **THEN** both dates fall back to the record's `verified` date
- **AND** the build reports how many records used the fallback

### Requirement: Audience accuracy
A program's `audience[]` SHALL list only the personas the program genuinely serves —
those for which the program has an explicit offering or eligibility path. A program
SHALL NOT carry an audience tag merely because it appeared in a source list themed
to that audience.

#### Scenario: Startup-only program not shown to other personas
- **WHEN** a program offers only a startup track (e.g. "MongoDB for Startups")
- **THEN** its `audience[]` is `[startup]`
- **AND** it does not appear on the student or nonprofit persona pages

#### Scenario: Multi-audience only when genuinely offered
- **WHEN** a program has distinct offerings for more than one persona (e.g. a vendor
  with both a startup program and a documented nonprofit or student plan)
- **THEN** `audience[]` lists each such persona
- **AND** each listed persona corresponds to a real eligibility path, not source provenance

#### Scenario: Same provider, different programs, different audiences
- **WHEN** a provider runs separate programs for different audiences (e.g. "Google
  for Startups" and "Google for Nonprofits")
- **THEN** each exists as its own record tagged for its own audience
  (`[startup]` and `[nonprofit]` respectively)
- **AND** correcting one record's `audience[]` never changes another record's, even
  for the same provider

#### Scenario: Audit corrects existing records
- **WHEN** the audience audit runs over the existing records
- **THEN** every record whose `audience[]` does not match its actual offering is corrected
- **AND** all records still pass schema validation (`audience` retains ≥1 entry)

