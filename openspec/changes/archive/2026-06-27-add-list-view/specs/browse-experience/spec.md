# Browse Experience

## ADDED Requirements

### Requirement: Tile / list view toggle

A program listing SHALL offer the visitor a choice between a tile (card) view and a
dense list view via a labelled, keyboard-operable toggle, defaulting to the tile view.
The list view SHALL present one aligned row per program oriented for scanning and
comparison (provider, title, value, and key metadata), and the chosen view SHALL
persist across pages and visits. Switching view SHALL change only the presentation —
the set of programs shown and their order SHALL be unchanged — and SHALL compose with
the active category filter, sort, and search.

#### Scenario: Switch to list view

- **WHEN** a visitor selects the list view
- **THEN** the same programs are shown as aligned rows (provider, title, value, key
  metadata) instead of cards, in the same order

#### Scenario: View choice composes with filter, sort, and search

- **WHEN** a category filter, sort, or search term is active and the visitor switches
  view
- **THEN** only the matching programs remain, in the selected sort order, in the new
  view — the filter/sort/search is preserved

#### Scenario: View choice is remembered

- **WHEN** a visitor who chose the list view navigates to another persona page or
  returns later
- **THEN** the listing renders in the list view without re-selecting it

#### Scenario: Toggle is accessible

- **WHEN** a keyboard or assistive-technology user reaches the view toggle
- **THEN** it is labelled, indicates the current view, and is fully operable without a
  pointer (WCAG 2.2 AA)
