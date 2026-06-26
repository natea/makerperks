# Design — Add Program Search

## Context

MakerPerks renders ~208 programs across persona pages. The only search today is a
per-persona in-page filter (`#q` on `/for/[audience]`) that substring-matches
title/provider/tags over the cards already in that persona's DOM. There is no way
to search the whole directory, and the design system's north star is explicitly
**Linear** (DESIGN.md), whose command palette is iconic. The site is static, has no
backend, and is PR-editable; whatever we add must hold those constraints. A
build-time `perks.json` already proves the pattern of deriving a static artifact
from the content collection.

## Goals / Non-Goals

**Goals:** global known-item lookup from any page; fuzzy, weighted, instant results
that include the new `summary`; zero backend and zero per-record upkeep; on-brand
(Linear-grade) palette; full keyboard + a11y; index reusable by a later `/search`
page and by agents.

**Non-Goals:** a backend or hosted search service (Algolia/Pagefind-hosted); a
deep-linkable `/search?q=` results **page** (tracked follow-up); replacing the
per-persona filter; server-side ranking/pagination; analytics on queries.

## Decision 1 — Build-time static index, not a service

Emit `search-index.json` from an Astro endpoint (`src/pages/search-index.json.ts`)
that reads the same published-program collection as `perks.json`. One entry per
program: `{ id, title, provider, summary, tags, value, audiences, path }`. At ~208
rows this is ~50–150 KB gzipped-tiny; the palette fetches it once on first open (not
on page load) and caches it. Regenerated every build, so it never drifts.

_Alternatives:_ Algolia / hosted Pagefind (rejected — adds a backend dependency and
cost, violates the no-backend ethos); inline the index into every page's HTML
(rejected — duplicates ~100 KB across 214 pages).

## Decision 2 — Fuse.js, weighted fields, typo-tolerant

Match client-side with Fuse.js. Field weights: `title` (highest) > `provider` >
`summary` > `tags`. `threshold` tuned so "postgres" reaches Neon/Supabase and a
one-character typo ("snetry") still finds Sentry, without flooding on noise.
`value`/`audiences` are payload (shown on the result), not matched.

_Alternatives:_ hand-rolled substring (today's approach — no typo tolerance, no
ranking, poor when "google" matches 7 records); MiniSearch (fine, but Fuse's
weighted fuzzy fits the small set and the user asked for Fuse).

## Decision 3 — Global command palette mounted in the layout

A `SearchPalette` component + client island mounted once in `Base.astro`, so it is
present on every page. Trigger: `⌘K` / `Ctrl-K` and `/`, plus a visible header
search affordance (so it is discoverable, not just a power-user shortcut). Built
with the native `<dialog>` element (top-layer, no `overflow` clipping, focus
trapping and Esc handled by the platform). Results are a listbox; selecting one
navigates to `path`. Lazy-load Fuse + the index on first open to keep initial page
weight unchanged.

_Alternatives:_ a header `<input>` with an absolutely-positioned dropdown (rejected
— stacking-context clipping under the sticky header; `<dialog>` avoids it); a
dedicated page only (rejected — slower for the "I know what I want" path; it's the
follow-up, not the primary surface).

## Decision 4 — Provider flooding handled by ranking + payload, not grouping (for now)

Multi-program providers (gcp has 5) can stack on a query like "google". The title
weight plus showing each result's distinct program title + value keeps stacked
results legible and individually actionable, so v1 ranks and lists rather than
grouping by provider. Grouping is a candidate refinement if it proves noisy.

## Decision 5 — A small synonym map, build-time

Dev synonyms materially help a builder directory: `postgres`→PostgreSQL,
`k8s`→kubernetes, `vector db`→embeddings/pgvector. Keep a tiny hand-curated map
applied when building index entries (expanding searchable text), not a runtime
dependency. Start minimal; it's data, easy to extend in a PR.

## Decision 6 — All UI through `impeccable`; `/search` page deferred

The palette, header affordance, result rows, and empty/loading states are
design-surface work and go through the `impeccable` skill (per CLAUDE.md). The
deep-linkable `/search?q=` page is **out of scope** here and tracked as a follow-up;
it will reuse this change's index and matching config.

## Risks / Trade-offs

- **Index staleness in dev** → it's an Astro endpoint built from the live
  collection, so `astro dev` serves it fresh; no manual regen step.
- **Fuzzy false positives** (too-loose threshold surfaces junk) → tune `threshold`
  against real queries during the in-browser iteration pass; prefer slightly strict.
- **First-open latency** (fetch + Fuse parse) → lazy-load on first invoke and cache;
  at this size it's a single small request, effectively instant on warm cache.
- **Keyboard-shortcut collisions** (`/` while typing elsewhere) → only bind global
  `/` when focus isn't in an input/textarea/contenteditable; `⌘K` is always safe.
- **No-JS users** get no palette → acceptable; the per-persona filter and persona
  navigation remain the non-JS path, and the `/search` follow-up will be crawlable.

## Open Questions

- Final `threshold` / per-field weights (resolve empirically in the iterate pass).
- Should results also offer "jump to persona / category", or programs only in v1?
  (Leaning programs-only to keep the surface focused.)
- Synonym map seed list — how many pairs ship in v1 vs. grow later.
