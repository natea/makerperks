# Data Ingest

## ADDED Requirements

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
