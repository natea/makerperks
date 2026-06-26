# Program Data

## ADDED Requirements

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
