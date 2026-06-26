# Browse Experience

## ADDED Requirements

### Requirement: User-selectable sort order
The directory SHALL let a visitor re-order a program listing via an explicit,
labelled sort control offering at least: dollar value (default), title A–Z, newly
added, and recently updated. The control SHALL compose with the active persona,
category filter, and search.

#### Scenario: Default order unchanged
- **WHEN** a listing renders without an explicit sort selection
- **THEN** programs are ordered by `max_value` descending

#### Scenario: Re-sort by date
- **WHEN** a visitor selects "Newly added" or "Recently updated"
- **THEN** the visible cards reorder by the corresponding derived date, descending

#### Scenario: Sort composes with filters
- **WHEN** a sort is active together with a category filter or search term
- **THEN** only the matching cards are shown, ordered by the selected sort

#### Scenario: Sort control is accessible
- **WHEN** a keyboard or assistive-technology user reaches the sort control
- **THEN** it is labelled and fully operable without a pointer (WCAG 2.2 AA)

### Requirement: Scannable card identity
Each program card SHALL present the provider's logo and a "what it is" summary line
so a visitor can identify the vendor and what it offers at a glance, with the dollar
value / discount remaining the prominent figure.

#### Scenario: Logo and summary on the card
- **WHEN** a program card renders and the provider has a logo and the record a summary
- **THEN** the uniform logo appears beside the provider/title
- **AND** the summary line is shown as the card's descriptive text instead of `intro`

#### Scenario: Graceful degradation
- **WHEN** the provider has no logo or the record has no summary
- **THEN** a monogram placeholder stands in for the logo
- **AND** a truncated `intro` stands in for the summary
- **AND** no broken-image icon or empty line is shown

#### Scenario: Identity on detail page
- **WHEN** a visitor opens a program detail page
- **THEN** the provider logo and summary are visible alongside the title
