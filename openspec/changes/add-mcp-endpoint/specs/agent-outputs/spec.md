# Agent Outputs

## ADDED Requirements

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
