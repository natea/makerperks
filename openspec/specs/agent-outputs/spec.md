# agent-outputs Specification

## Purpose
TBD - created by archiving change add-makerperks-directory. Update Purpose after archive.
## Requirements
### Requirement: Machine-readable dataset
The directory SHALL publish the full program dataset as `/perks.json`, generated
at build time from the canonical YAML records.

#### Scenario: Dataset reflects source of truth
- **WHEN** the site is built
- **THEN** `/perks.json` contains every non-draft program with its full fields
- **AND** it is regenerated from the YAML records so it cannot drift from the site

### Requirement: LLM index files
The directory SHALL publish `/llms.txt` (curated index linking each program) and
`/llms-full.txt` (every program inlined into one document), generated at build time.

#### Scenario: llms.txt lists programs
- **WHEN** an agent fetches `/llms.txt`
- **THEN** it receives a structured index of programs grouped by persona/category with links

#### Scenario: llms-full.txt is self-contained
- **WHEN** an agent fetches `/llms-full.txt`
- **THEN** it receives the full text of every program in a single document

### Requirement: Structured metadata
Each program page SHALL embed schema.org JSON-LD describing the offer and provider,
and the site SHALL publish a sitemap.

#### Scenario: JSON-LD present
- **WHEN** a program detail page is rendered
- **THEN** its `<head>` includes schema.org JSON-LD for the offer/provider

#### Scenario: Sitemap published
- **WHEN** the site is built
- **THEN** `/sitemap.xml` is generated listing all program and persona pages

