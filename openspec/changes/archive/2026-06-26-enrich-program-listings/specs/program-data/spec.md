# Program Data

## ADDED Requirements

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
