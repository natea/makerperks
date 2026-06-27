# Design — Tile / List view toggle

## Context

The persona listing (`src/pages/for/[audience].astro`) renders programs as a card
grid (`ProgramCard`), with a client-side filter (facets), sort `<select>`, and search
all operating on per-card `data-*` attributes. Cards already expose
`data-value/-title/-added/-updated/-tags/-search`. The ask is a second presentation —
a dense list — without forking the data or the interaction logic.

## Goals / Non-Goals

**Goals:** a comparison-friendly list view; a clear, accessible toggle; the choice is
remembered; both views compose identically with filter/sort/search; one DOM item per
program (no duplication).

**Non-Goals:** changing data, sort/filter/search behavior, or the detail page; a
server-rendered preference; a full data-table with column sorting (the existing sort
control already covers ordering).

## Decisions

### Decision 1 — One item, two layouts (CSS-driven)

Keep a single program element per record (so filter/sort/search keep working on the
same nodes and the DOM doesn't double). The grid container carries a mode class
(`is-tiles` / `is-list`); `ProgramCard` is made layout-flexible so the same logo /
provider / title / summary / value / verified pieces reflow from a stacked card into
an aligned row via CSS. No second component, no duplicated 200-node tree.

_Alternative:_ render both a card and a row per program and toggle visibility
(simpler CSS, but doubles the DOM and the data attributes) — rejected.

### Decision 2 — Toggle in the toolbar, persisted

A small segmented control (Tile · List) next to the sort `<select>`. Default = tile
(unchanged). The choice is stored in `localStorage` and applied on load (before paint
where possible) so it persists across persona pages and visits. Implemented as a
button group with `aria-pressed`, fully keyboard-operable.

### Decision 3 — Compose, don't fork

The toggle only adds/removes the container mode class. `apply()` (filter + search) and
`reorder()` (sort) are untouched — they hide/show and reorder the same items
regardless of view. Switching view mid-filter keeps the active filter/sort/search.

### Decision 4 — List row content & responsiveness

Row, left→right: provider logo (small) · title + one-line summary · a couple of key
tags · value (green, tabular, right-aligned) · verified date. On narrow screens the
row simplifies (drop the summary/tags, keep logo · title · value) rather than
horizontal-scrolling. The list is a semantic list (`role="list"`/`<ul>`); value stays
tabular for column alignment — the comparison payoff.

## Risks / Trade-offs

- **CSS reflow complexity** (one markup, two very different layouts) → keep the card
  markup order list-friendly; verify both layouts at every breakpoint in the
  impeccable pass.
- **FOUC of the wrong view** on load → read `localStorage` and set the mode class as
  early as possible (inline head script or first paint) to avoid a tile→list flash.
- **Empty/long states** → the empty state and "+N more" facet disclosure must look
  right in both views.

## Open Questions

- Whether the homepage "Highest value" grid also gets the toggle (lean: persona
  listings only for v1).
- Exactly which fields the narrow-screen list row keeps (resolve during the build).
