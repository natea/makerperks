## ADDED Requirements

### Requirement: Global program search

The directory SHALL provide a global program search reachable from every page,
independent of the active persona. The search SHALL match across all published
programs by weighted fields — title, provider, summary, and tags — with
typo-tolerant (fuzzy) ranking, and SHALL navigate the visitor directly to a
selected program's detail page. This is distinct from, and does not replace, the
per-persona in-page filter described by the "Search" requirement.

#### Scenario: Reachable from any page

- **WHEN** a visitor presses the search shortcut (`⌘K` / `Ctrl-K` or `/`) or
  activates the header search affordance on any page
- **THEN** a search command palette opens, ready for input, without a full page load

#### Scenario: Searches the whole directory

- **WHEN** a visitor types a query into the global search
- **THEN** matching programs are returned from across all published programs,
  regardless of any persona or category context of the originating page

#### Scenario: Typo-tolerant, weighted ranking

- **WHEN** a query contains a minor typo or matches a program's summary rather than
  its title (e.g. "snetry", or "postgres" for a Postgres host)
- **THEN** the relevant program still appears, ranked by field weight
  (title > provider > summary > tags)

#### Scenario: Results carry decision signal

- **WHEN** results are shown
- **THEN** each result displays the program title, provider, and its dollar
  value / discount so the visitor can judge relevance without opening it

#### Scenario: Selecting a result navigates

- **WHEN** a visitor selects a result by pointer or keyboard
- **THEN** the browser navigates to that program's detail page

#### Scenario: No matches

- **WHEN** a query matches no programs
- **THEN** the palette shows a clear empty state rather than an error or blank list

#### Scenario: Keyboard and assistive-technology operable

- **WHEN** a keyboard or assistive-technology user opens the search
- **THEN** focus moves into the field, results are navigable and selectable by
  keyboard, Escape closes the palette, and the control set is labelled (WCAG 2.2 AA)
