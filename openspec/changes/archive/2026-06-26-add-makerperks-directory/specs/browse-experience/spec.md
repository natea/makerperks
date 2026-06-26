# Browse Experience

## ADDED Requirements

### Requirement: Persona-first navigation
The directory SHALL present "Who are you?" persona selection as the primary
navigation across `startup | student | oss | indie | ambassador | nonprofit`.

#### Scenario: Persona filters the directory
- **WHEN** a visitor selects a persona
- **THEN** only programs whose `audience[]` includes that persona are shown

#### Scenario: Umbrella gateway surfaced first
- **WHEN** a persona page renders
- **THEN** its umbrella gateway program(s) are presented before the long tail

### Requirement: Filtering and sorting
The directory SHALL allow filtering by audience and category and SHALL default to
sorting by maximum dollar value descending.

#### Scenario: Default sort by value
- **WHEN** a list of programs is displayed without an explicit sort
- **THEN** programs are ordered by `max_value` descending

#### Scenario: Category filter
- **WHEN** a visitor applies a category filter
- **THEN** only programs in that category remain, combinable with the active persona

### Requirement: Program detail
Each program SHALL have a detail view exposing its tiers, eligibility,
steps to apply, FAQ, redeem link, sources, and verified date.

#### Scenario: Trust signals visible
- **WHEN** a visitor opens a program detail page
- **THEN** the `verified` date and any `region`/`status` badges are visible
- **AND** the redeem link points to the official program page

### Requirement: Search
The directory SHALL provide search across program title, provider, and tags.

#### Scenario: Find by vendor
- **WHEN** a visitor searches a vendor name
- **THEN** matching programs are returned regardless of the active persona filter
