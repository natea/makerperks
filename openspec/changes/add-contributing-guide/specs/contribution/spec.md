# Contribution

## ADDED Requirements

### Requirement: Discoverable contribution guide

The site SHALL provide a Contribute affordance that links to the repository's
contribution guide explaining how to add or edit a provider/perk via pull request,
including the data-file location, the schema and required fields, the validation
step, and a path for non-coders (issue forms). The link SHALL resolve to a real,
rendered page (not the bare org profile).

#### Scenario: Contribute link reaches the guide

- **WHEN** a visitor activates the Contribute link
- **THEN** they land on the repository's contribution guide that explains adding or
  editing a provider/perk via PR (and the issue-form path for non-coders)

#### Scenario: Not a dead end

- **WHEN** the Contribute link is followed
- **THEN** it does not land on a bare profile or repository root with no contribution
  instructions

### Requirement: Audience guidance matches the accuracy rule

The contribution guide SHALL instruct contributors to set `audience[]` to only the
personas the program genuinely serves (a real offering or eligibility path), and
SHALL NOT instruct adding an audience merely because the program appeared in a source
list themed to that persona — consistent with the *Audience accuracy* requirement.

#### Scenario: Guide reflects audience accuracy

- **WHEN** a contributor reads the audience guidance
- **THEN** it directs them to tag only genuinely-served personas, not source-inferred
  ones
