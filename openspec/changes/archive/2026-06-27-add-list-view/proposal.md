## Why

The listing only offers a tile/card grid. A directory's core job is *comparison* —
"which of these is worth the most, and which do I qualify for?" — and a dense **list
view** scans and compares far better than tiles (you see more rows at once, aligned
on value and provider). This is direct user feedback ("include a list view — I've
never met a day when a tile view was the right view").

## What Changes

- **Add a view toggle** (Tile · List) to the persona listing toolbar, defaulting to
  the current tile view, with the choice **remembered** across pages/visits.
- **Add a compact list view** — one aligned row per program (provider logo · title +
  summary · value · key tags · verified date) optimized for scanning and comparison.
- **Both views share one data source and compose with the existing
  filter/sort/search** — switching view never changes which programs show or their
  order; only the presentation.
- Built through the `impeccable` skill on the "Trusted Ledger" system; the toggle is
  labelled and keyboard-operable (WCAG 2.2 AA).

## Capabilities

### New Capabilities

(none — extends browse-experience.)

### Modified Capabilities

- `browse-experience`: add a user-selectable **tile/list view** for program listings,
  with the list view as a dense, comparison-oriented alternative that composes with
  the existing filter, sort, and search.

## Impact

- **Affected specs:** `browse-experience` (added requirement).
- **Affected code:** `src/pages/for/[audience].astro` (view toggle + list layout +
  client toggle/persistence), `src/components/ProgramCard.astro` (layout-flexible so
  one item renders as tile or row — no duplicated DOM), and listing CSS.
- **Non-goals:** no change to the data, filter/sort/search logic, or the program
  detail page; no server-side rendering of the preference (client-persisted).
