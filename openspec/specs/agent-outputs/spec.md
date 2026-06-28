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

### Requirement: Interactive MCP query interface
In addition to the static dataset and index files, the project SHALL provide an
official Model Context Protocol (MCP) endpoint that lets an AI agent query the
directory through read-only tools, backed by the same source of truth as the static
outputs. The endpoint SHALL be public and read-only, and SHALL be discoverable from
the site's agent surfaces.

#### Scenario: Agent queries via MCP tools
- **WHEN** an AI agent connects to the MCP endpoint and calls a query tool
  (e.g. search perks, perks for a persona, or get a perk by slug)
- **THEN** it receives structured results drawn from the same data as `perks.json`,
  without fetching and filtering the whole dataset itself

#### Scenario: Read-only and current
- **WHEN** the directory data changes and is redeployed
- **THEN** the MCP endpoint reflects the updated data (it reads the published dataset),
  and it exposes no tools that modify the directory

#### Scenario: Discoverable
- **WHEN** an agent inspects the site's agent surfaces (e.g. `llms.txt`)
- **THEN** the MCP endpoint is documented there so the agent can find and connect to it

