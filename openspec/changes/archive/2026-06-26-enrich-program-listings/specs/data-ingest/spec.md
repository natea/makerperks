# Data Ingest

## ADDED Requirements

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
