# data-ingest Specification

## Purpose
TBD - created by archiving change add-makerperks-directory. Update Purpose after archive.
## Requirements
### Requirement: Canonical import from cloudcredits.io
The system SHALL import the cloudcredits.io program dataset as seed canonical
records, preserving its values and tier detail, with MIT attribution.

#### Scenario: Imported record attributed
- **WHEN** a cloudcredits.io program is imported
- **THEN** its record lists `cloudcredits.io` in `sources[]`
- **AND** the project retains a NOTICE/attribution acknowledging the MIT-licensed source

### Requirement: Source reconciliation
The system SHALL match entries from the locked source lists against canonical
records by `provider_slug` and normalized domain/URL, merging rather than duplicating.

#### Scenario: Match merges metadata
- **WHEN** a source-list entry matches an existing canonical record
- **THEN** its `audience`, `region`, and `sources` are merged into that record
- **AND** richer cloudcredits.io values (tiers, amounts) are NOT overwritten by thinner source data

#### Scenario: No match creates record
- **WHEN** a source-list entry matches no canonical record and passes the scope fence
- **THEN** a new canonical record is created from it

#### Scenario: Distinct vendor programs stay distinct
- **WHEN** a vendor offers genuinely different programs (e.g. Google Cloud base vs Google Cloud AI tier)
- **THEN** each is kept as its own canonical record, not merged

### Requirement: Known-bad link correction
The system SHALL correct seed links known to be mislabeled during reconciliation.

#### Scenario: Seed link fixed
- **WHEN** ingesting the LinkedIn seed Hugging Face and Cursor entries
- **THEN** their redeem URLs are corrected to the official startup/student program pages

### Requirement: Aggregator relationships
The system SHALL mark umbrella gateway programs and record the programs they unlock.

#### Scenario: Gateway tagged
- **WHEN** a program is an umbrella aggregator (e.g. Brex, Ramp, Mercury, Stripe Atlas, TechSoup, GitHub Student Pack, Y Combinator)
- **THEN** `aggregator` is true and `unlocks[]` lists the downstream programs it grants access to

### Requirement: Logo acquisition at build/seed
The system SHALL provide a repeatable script that acquires each provider's logo from
the program `url` domain via Logo.dev (using the `LOGO_DEV_TOKEN` publishable token),
falling back to a favicon service on a miss, normalizes it to a uniform square, and
commits it under `public/logos/`. The token SHALL be read only at build/seed time
and never committed or shipped.

#### Scenario: Logo fetched and normalized
- **WHEN** the logo script runs for a provider with a resolvable domain
- **THEN** it writes a uniform-square logo image under `public/logos/<provider_slug>`
- **AND** the publishable token is not present in any committed file or shipped output

#### Scenario: Fallback and misses reported
- **WHEN** Logo.dev returns no logo for a domain
- **THEN** the script attempts the favicon fallback
- **AND** providers with no result at all are reported so placeholders are known

#### Scenario: Idempotent re-runs
- **WHEN** the script runs again
- **THEN** providers with an existing committed logo are skipped unless a refresh is requested
- **AND** the external API is not re-hit for already-acquired logos

### Requirement: Git-derived record dates
The build SHALL derive `added` (first commit) and `updated` (latest commit) dates per
program file from git history and make them available to the listing, requiring CI to
check out full history.

#### Scenario: Full-history build derives dates
- **WHEN** the build runs against a repository with complete git history
- **THEN** every program file resolves to an `added` and `updated` date from its commits

#### Scenario: CI configured for derivation
- **WHEN** CI checks out the repository for a build
- **THEN** it fetches full history (no shallow clone) so date derivation is correct

### Requirement: Audience not inferred from source membership alone
Reconciliation SHALL NOT add a persona to a program's `audience[]` solely because the
program appeared in a source list themed to that persona. An audience assignment SHALL
require corroboration from the program's own offering (title, description, eligibility,
or a documented audience-specific program URL).

#### Scenario: Themed source does not auto-assign audience
- **WHEN** a startup program is found in a nonprofit- or student-themed source list
- **THEN** reconciliation does not add `nonprofit` / `student` from that fact alone
- **AND** the audience is added only if the program itself offers that audience a path

#### Scenario: Corroborated audience is retained
- **WHEN** a program both appears in an audience-themed source and offers that audience
  an explicit program or eligibility
- **THEN** that audience is recorded in `audience[]`

