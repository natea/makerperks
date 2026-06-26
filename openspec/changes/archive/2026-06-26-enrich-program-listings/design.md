# Design — Enrich Program Listings

## Context

The browse experience renders ~208 program cards per persona, value-sorted, with a
client-side search + category filter (see `src/pages/for/[audience].astro`). Cards
come from `src/components/ProgramCard.astro` and currently show: provider slug, a
few tags, title, the promotional `intro`, the bold value, and the `verified` date.
This change makes lists re-sortable, replaces the pitch line with a "what it is"
summary, and adds logos — without introducing a backend or breaking the
PR-editable, statically-built model.

## Goals / Non-Goals

**Goals:** scannable cards (logo + what-it-is line); honest, zero-upkeep date
sorts; uniform logos with no runtime dependency; all UI through `impeccable`.

**Non-Goals:** server-side sort/pagination; value re-verification; new schema the
editor must hand-maintain for dates; logo hotlinking.

## Decision 1 — Date sorts derive from git, not new schema fields

"Newly added" and "recently updated" need per-record dates. Rather than add
hand-authored `added` / `updated` fields (which drift and burden PR authors), we
derive them at build time from git:

- `added` = author date of the file's **first** commit.
- `updated` = author date of the file's **most recent** commit.

A small script (`scripts/git-dates.mjs`) shells `git log --follow --format=%aI`
per program file and emits a `provider_slug/program → {added, updated}` map the
listing reads. Build-time only; nothing is written back into the YAML.

**Fallbacks (must be explicit, never silently wrong):**
- Shallow clone / no history (the reason CI sets `fetch-depth: 0`): fall back to
  the record's `verified` date for both, and `log()` how many records used the
  fallback so a degraded build is visible rather than silently mis-sorted.
- A brand-new file not yet committed: treat as today's build is **not** allowed
  (no `Date.now()` determinism guarantee); fall back to `verified`.

## Decision 2 — `summary` is an optional field with a graceful fallback

Add `summary: z.string().max(120).optional()` to the program schema. The card
prefers `summary`; if absent it falls back to a truncated `intro` so the site never
breaks mid-rollout. The backfill task populates `summary` on every record, after
which the fallback is dead code we keep as a safety net.

**Content rule for `summary`:** neutral, ≤ ~14 words, leads with the noun —
_"Managed Postgres hosting with branching and autoscaling"_, not _"Supercharge your
data layer!"_. No dollar figures (the value line already carries those). Generated
in batches by agents reading each record's `description`/`tiers`, then schema- and
lint-validated like any other field.

## Decision 3 — Logos: Logo.dev (publishable) + favicon fallback, committed locally

- **Source:** `https://img.logo.dev/<domain>?token=<pk_…>&size=128&format=png`,
  domain parsed from each program's `url`. Falls back to
  `https://www.google.com/s2/favicons?domain=<domain>&sz=128` on miss/non-200.
- **Token:** `LOGO_DEV_TOKEN` from `.env`, read only by the seed script. Because we
  commit the resulting images, the token never reaches the shipped site (the
  publishable token is the correct one for the image endpoint regardless).
- **Storage:** one image per provider at `public/logos/<provider_slug>.png`; the
  `providers` collection's existing optional `logo` field records the path. Logos
  are keyed by provider, not program, so multi-program vendors fetch once.
- **Uniformity:** normalize every logo to a 128×128 square (contain, transparent
  pad) so cards align regardless of source aspect ratio.
- **Misses:** providers with neither a Logo.dev hit nor a favicon get a neutral
  monogram placeholder (first letter on a tinted chip) rendered by the card — no
  broken-image icons.
- **Idempotent + cheap:** the seed script skips providers whose logo already exists
  unless `--refresh` is passed, so it is safe to re-run and doesn't re-hit the API.

## Decision 4 — Sorting stays client-side

The listing already ships all cards in the DOM and filters them client-side. Sort
follows the same model: cards carry `data-value`, `data-title`, `data-added`,
`data-updated`; a sort `<select>` reorders the grid in place via the existing
`apply()` path. No new network calls, no SSR, works with the static build.

## Decision 5 — All UI work goes through `impeccable`

Per `CLAUDE.md`, the sort control, the logo treatment on cards/detail, and the
summary line are design-surface changes and MUST be built via the `impeccable`
skill (which reads `PRODUCT.md` / `DESIGN.md` and enforces the anti-references).
The data/build tasks — schema field, git-date script, logo seed script, backfill —
are exempt.

## Risks

- **Logo licensing/quality.** Brand logos are used nominatively to identify each
  program; we keep them small, unaltered, and link to the official site. Favicon
  fallbacks can be low-res — the 128px normalize + monogram placeholder bound the
  worst case.
- **Git-date accuracy.** Bulk-imported records share an import commit, so many
  `added` dates will cluster on the import date. That is accurate ("added to the
  directory then") and acceptable; `verified` still reflects offer freshness.
