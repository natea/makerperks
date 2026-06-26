# Tasks — Add Program Search

> **Design rule:** all UI/UX work in this change MUST go through the `impeccable`
> skill (it reads `PRODUCT.md` / `DESIGN.md` and enforces the anti-references).
> Data/build tasks (index endpoint, dependency, synonym map) are exempt. See
> `design.md` Decision 6 and `CLAUDE.md`.
>
> **Scope:** build-time index + global command palette. The deep-linkable
> `/search?q=` results **page** is a tracked follow-up and is NOT in this change
> (see §5).

## 1. Dependency

- [x] 1.1 Add `fuse.js` to `package.json` (client-side only; ships its own types)

## 2. Build-time search index (data/build)

- [x] 2.1 Add `src/pages/search-index.json.ts` — an Astro endpoint that reads the
  published-program collection (same source as `perks.json`) and emits one entry per
  program: `{ id/path, title, provider, summary, tags, value, audiences }`
- [x] 2.2 Exclude `draft` programs from the index
- [x] 2.3 Add a small build-time synonym map (e.g. `postgres`→PostgreSQL,
  `k8s`→kubernetes) that expands an entry's searchable text (design.md Decision 5)
- [x] 2.4 Confirm the index regenerates on every `astro dev` / `astro build` with no
  manual step, and that the JSON is well-formed

## 3. Search palette — via `/impeccable`

- [x] 3.0 Build every surface in this section through the impeccable skill; browser-verify
- [x] 3.1 `SearchPalette` component + client island, mounted once in
  `src/layouts/Base.astro` so it is present on every page (native `<dialog>`,
  top-layer, platform focus-trap + Esc)
- [x] 3.2 Lazy-load Fuse + fetch `search-index.json` on first open; cache thereafter
  (no added weight on initial page load — design.md Decision 3)
- [x] 3.3 Wire Fuse with weighted fields (title > provider > summary > tags) and a
  tuned `threshold`; rank results (design.md Decision 2)
- [x] 3.4 Triggers: `⌘K` / `Ctrl-K` and `/` (only when focus is not in an input /
  textarea / contenteditable), plus a visible header search affordance
- [x] 3.5 Result rows show title + provider + value/discount; selecting (pointer or
  keyboard) navigates to the program detail page
- [x] 3.6 Empty state when no matches; loading state on first fetch (no blank flash)
- [x] 3.7 Accessibility: focus moves into the field on open, results are a keyboard-
  navigable listbox, Escape closes, controls are labelled, reduced-motion respected
  (WCAG 2.2 AA)

## 4. Verify

- [x] 4.1 Global search opens from a persona page, the homepage, and a program detail
  page; returns matches across all programs regardless of origin
- [x] 4.2 Fuzzy/weighting behaves: a summary-only term and a one-char typo both find
  the right program; multi-program providers stay legible
- [x] 4.3 `openspec validate add-program-search --strict` passes; typecheck, lint,
  build green; `search-index.json` present in `dist/`

## 5. Follow-up (OUT OF SCOPE — not tracked as work here)

> Intentionally a plain note, not a checkbox, so it doesn't gate this change's
> completion. Promote to its own change when prioritized.

- Dedicated `/search?q=` results page (shareable URLs + SEO), reusing this change's
  build-time index and Fuse config.
