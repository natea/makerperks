## Why

Today search only exists *inside* a persona page: a per-page filter that matches
title/provider/tags across the ~200 cards already in that persona's DOM. A visitor
who arrives knowing the tool they want ("Postgres credits", "Sentry", "a vector
DB") has no way to look it up without first guessing which persona bucket it lives
in. The directory is missing its second spine — known-item lookup — alongside the
persona-first discovery spine. It also can't match on the new `summary` text or
tolerate typos, so relevant programs are missed.

## What Changes

- **Add a global, site-wide program search** reachable from any page via a command
  palette (⌘K / `/`, plus a visible header affordance). It searches *all* published
  programs, not just the current persona, and routes a result straight to its
  program detail page.
- **Fuzzy, weighted matching with Fuse.js.** Rank across weighted fields
  (title > provider > summary > tags) with typo tolerance, so "postgres" finds Neon
  and "snetry" still finds Sentry. Show value + audience on each result so a searcher
  can judge relevance without a click.
- **Build a search index at build time.** Emit a small static `search-index.json`
  derived from the content collection (the same source of truth as `perks.json`),
  loaded once by the palette. No backend, no third-party search service — consistent
  with the static, PR-editable model.
- **Keep the existing per-persona filter as-is.** It remains the right tool *within*
  a persona; this change adds the global layer, it does not replace the in-page one.
- The new index is incidentally agent-consumable, but its primary consumer is the
  in-browser palette.

## Capabilities

### New Capabilities

(none — search is an existing capability area; see Modified.)

### Modified Capabilities

- `browse-experience`: add a **global program search** requirement — a command
  palette, reachable from every page, that fuzzy-matches all programs by weighted
  fields and navigates to a program. The existing in-page persona "Search"
  requirement is unchanged and explicitly scoped as the per-persona filter.
- `data-ingest`: add a **build-time search index** requirement — the build derives
  `search-index.json` (id, title, provider, summary, tags, value, audiences, path)
  from the program collection, regenerated on every build with no hand-maintenance.

## Impact

- **Affected specs:** `browse-experience` (global palette search), `data-ingest`
  (search-index build artifact).
- **Affected code:** new search-index generator (an Astro endpoint
  `src/pages/search-index.json.ts`, built from the same collection as `perks.json`);
  a new global `SearchPalette` component + client island mounted in
  `src/layouts/Base.astro` (so it's on every page); a header search affordance / ⌘K
  trigger in the site header. UI surfaces go through the `impeccable` skill.
- **Dependencies:** add `fuse.js` (small, ships its own types; client-side only).
- **Non-goals / tracked follow-up:** a dedicated, deep-linkable `/search?q=…`
  results **page** (shareable URLs + SEO) is intentionally **out of scope** for this
  change and tracked as a follow-up. The build-time index this change adds is the
  foundation that page will reuse, so the follow-up is cheap once this lands.
