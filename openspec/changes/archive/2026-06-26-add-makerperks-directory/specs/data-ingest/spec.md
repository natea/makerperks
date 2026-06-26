# Data Ingest

## ADDED Requirements

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
