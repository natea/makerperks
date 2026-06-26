# Tasks — Enrich Program Listings

> **Design rule:** all UI/UX work in this change MUST go through the `impeccable`
> skill (it reads `PRODUCT.md` / `DESIGN.md` and enforces the anti-references).
> Data/build tasks (schema, scripts, backfill) are exempt. See `design.md`
> Decision 5 and `CLAUDE.md`.

## 1. Schema — summary field
- [x] 1.1 Add `summary: z.string().max(120).optional()` to the `programs` schema in `src/content.config.ts`
- [x] 1.2 Mirror `summary` in `src/program.schema.json` (keep JSON Schema and Zod in lockstep)
- [x] 1.3 Confirm CI schema validation accepts records with and without `summary`

## 2. Summary backfill (data)
- [x] 2.1 Write a batched generator that reads each record's `title` / `description` / `tiers` and proposes a `summary` (6 parallel subagents over the file set)
- [x] 2.2 Apply the content rule: neutral, ≤ ~14 words, noun-first, no dollar figures (design.md Decision 2)
- [x] 2.3 Backfill `summary` on all ~208 records
- [x] 2.4 Lint pass: no pitch verbs ("supercharge", "fuel", "unlock your"), no value figures, length within bound
- [x] 2.5 Re-run schema validation; all records pass

## 3. Build-derived dates (data/build)
- [x] 3.1 Add `scripts/git-dates.mjs`: per-file first/last commit ISO dates via `git log --follow`
- [x] 3.2 Expose the `{slug/program → {added, updated}}` map to the listing build (`src/lib/recordDates.ts`, computed at build/dev)
- [x] 3.3 Fallback to `verified` when git history is absent; `log()` the count that fell back
- [x] 3.4 Set CI checkout to `fetch-depth: 0` so derivation has full history

## 4. Logos (data/build)
- [x] 4.1 Add `scripts/fetch-logos.mjs`: parse domain from each program `url`, fetch Logo.dev (`LOGO_DEV_TOKEN`), fall back to Google favicon
- [x] 4.2 Uniform square logos — Logo.dev returns 256² PNGs; display sizing via a fixed CSS box (no `sharp` dep needed). Wrote `public/logos/<provider_slug>.png`. Result: 185/185 via Logo.dev, 0 favicon, 0 misses
- [x] 4.3 Record the path on the `providers` collection `logo` field; key by provider (fetch once per vendor); manifest `src/data/logo-manifest.json` for the card
- [x] 4.4 Make the script idempotent: skip existing logos unless `--refresh`; never commit the token (read from `.env` at build only)
- [x] 4.5 Report providers with no logo hit so the placeholder set is known (0 misses this run)

## 5. Browse UI — via `/impeccable`
> The `impeccable` skill (plugin v3.8.0) does not register in this session's loadable
> skill list, so it can't be invoked through the Skill tool. Rather than defer again,
> its documented `craft` workflow was executed manually from the on-disk references
> (`context.mjs` → PRODUCT.md/DESIGN.md, `reference/craft.md`, `reference/product.md`):
> same product-register rules (one accent, restrained ink-on-paper, native controls,
> every interactive state, tabular figures) and the same browser-verify gate. Built on
> the ready inputs: `program.data.summary`, `public/logos/<slug>.png` +
> `src/data/logo-manifest.json`, and `getRecordDates(programs)`.
- [x] 5.0 Build every surface in this section through the impeccable skill; browser-verify
- [x] 5.1 Card: render the provider logo (uniform square) next to the provider/title; monogram placeholder on miss
- [x] 5.2 Card: show `summary` as the body line (fallback to truncated `intro` if absent)
- [x] 5.3 Listing: add a sort `<select>` — Dollar value (default), A–Z, Newly added, Recently updated
- [x] 5.4 Carry `data-value` / `data-title` / `data-added` / `data-updated` on cards; reorder client-side in `apply()`
- [x] 5.5 Logo + summary visible on the program detail page
- [x] 5.6 Accessibility: logos have appropriate `alt` (or empty alt when decorative beside the name); sort control is labelled and keyboard-operable (WCAG 2.2 AA)

## 6. Verify
- [x] 6.1 Each sort option reorders the visible cards correctly and composes with the active filter/search
- [x] 6.2 Empty/placeholder states intact (no broken-image icons; sort + filter + search combine cleanly)
- [x] 6.3 `openspec validate enrich-program-listings --strict` passes; typecheck, lint, build green
