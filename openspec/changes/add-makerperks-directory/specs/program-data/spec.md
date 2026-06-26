# Program Data

## ADDED Requirements

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
