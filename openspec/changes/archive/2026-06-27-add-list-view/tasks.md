# Tasks — Tile / List view toggle

> **Design rule:** this is a browse-UI design surface and MUST be built through the
> `impeccable` skill (Trusted-Ledger system). No data/schema change.

## 1. View toggle — via `/impeccable`

- [x] 1.0 Build every surface here through impeccable; browser-verify both views at
  mobile/tablet/desktop
- [x] 1.1 Add a labelled segmented toggle (Tile · List) to the listing toolbar next to
  the sort control; `aria-pressed`, keyboard-operable; default = tile
- [x] 1.2 Persist the choice in `localStorage` and apply it on load early enough to
  avoid a tile→list flash (FOUC)

## 2. List layout — via `/impeccable`

- [x] 2.1 Make `ProgramCard` layout-flexible so one item renders as a tile or an
  aligned row (no duplicated DOM); container mode class `is-tiles` / `is-list`
- [x] 2.2 List row: provider logo · title + one-line summary · key tags · value
  (green, tabular, right-aligned) · verified; value stays tabular for column alignment
- [x] 2.3 Narrow-screen list row simplifies (logo · title · value) instead of
  horizontal scrolling; empty state and "+N more" facet disclosure correct in both views

## 3. Compose with existing interactions

- [x] 3.1 Toggle only swaps the container mode class; `apply()` (filter+search) and
  `reorder()` (sort) untouched — both views show/hide and reorder the same items
- [x] 3.2 Verify view + filter + sort + search all compose in both views

## 4. Verify

- [x] 4.1 Switch tile↔list keeps the visible set + order; choice persists across
  persona pages and reload
- [x] 4.2 List view is scannable and aligned on value; both views pass AA contrast and
  the toggle is keyboard-operable
- [x] 4.3 `openspec validate add-list-view --strict` passes; typecheck, lint, build green
