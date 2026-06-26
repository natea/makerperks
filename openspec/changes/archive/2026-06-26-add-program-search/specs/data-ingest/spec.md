## ADDED Requirements

### Requirement: Build-time search index

The build SHALL emit a static search index derived from the published-program
collection (the same source of truth as the machine-readable dataset). The index
SHALL contain one entry per published program with the fields needed to search and
render a result — at minimum `id`/path, `title`, `provider`, `summary`, `tags`,
`value`, and `audiences` — and SHALL be regenerated on every build with no
hand-maintained input. Draft programs SHALL be excluded.

#### Scenario: Index generated from the collection

- **WHEN** the site is built
- **THEN** a static `search-index.json` is produced containing one entry per
  published program, each carrying the searchable and display fields

#### Scenario: Excludes drafts

- **WHEN** a program is marked `draft`
- **THEN** it does not appear in the search index

#### Scenario: Stays current without manual upkeep

- **WHEN** a program record is added, edited, or removed and the site is rebuilt
- **THEN** the search index reflects the change with no separate manual regeneration step
