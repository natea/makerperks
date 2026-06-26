# Enrich Program Listings

> **Project:** MakerPerks — a browseable, agent-friendly directory of builder perks.
> Builds on the shipped `add-makerperks-directory` change (personas, schema, import,
> browse experience, agent outputs).

## Why

The directory now holds 200+ programs, but the listing is hard to scan and thin on
trust signals:

1. **No way to re-sort.** Lists render in a single max-$ order with no visible
   control. A visitor who wants the newest program, an A–Z scan, or the most
   recently updated entry has no path to it.
2. **Card copy wastes its most valuable line.** The dollar value / discount is
   already shown boldly, yet the card's body text repeats a promotional `intro`
   ("Fuel your startup journey…") instead of answering the one question a scanner
   has: _what is this and what does it provide?_
3. **No brand recognition.** Every card is text-only. Logos let a visitor spot AWS,
   Stripe, or GitHub at a glance and signal that the entry is a real, known vendor.

## What Changes

- **User-selectable sort** on persona listing pages: Dollar value (default),
  A–Z by title, Newly added, Recently updated. Built through the `impeccable`
  skill; client-side, consistent with the existing filter.
- **Build-derived record dates.** Compute each record's `added` (first git commit)
  and `updated` (last git commit touching the file) at build time and expose them
  to the listing so the date sorts are honest and need no manual upkeep.
- **A "what it is" summary line.** Add a `summary` field — a crisp, neutral
  one-liner stating what the software/service is or provides (not a pitch). Render
  it on cards in place of `intro`. Backfill all existing records.
- **Provider logos.** Fetch each provider's official branded logo once at build/seed
  time (Logo.dev publishable token, with a Google-favicon fallback) from the
  program's `url` domain, normalize to a uniform square, and commit it under
  `public/logos/`. Render it on cards and program detail next to the provider/title.
  A neutral monogram placeholder covers any provider with no logo.

## Impact

- **Affected specs:** `program-data` (summary, logo asset, derived dates),
  `browse-experience` (sort control, card identity), `data-ingest` (logo
  acquisition, git-date derivation).
- **Affected code:** `src/content.config.ts` (new `summary` field; provider `logo`),
  `src/components/ProgramCard.astro`, `src/pages/for/[audience].astro` and other
  listing surfaces, new `scripts/` for logo fetch + git-date derivation, the
  `providers` collection, and `public/logos/`.
- **Config:** `LOGO_DEV_TOKEN` (publishable `pk_…`) read from `.env` at build/seed
  time only; never shipped in the static output. CI must clone full git history
  (`fetch-depth: 0`) for the date derivation.

## Non-goals

- No runtime logo hotlinking — logos are committed assets, fetched once.
- No re-verification of program dollar values, and no change to `verified`.
- No new audiences, accounts, submissions UI, or backend.
- No server-side sort/pagination — listings stay static + client-filtered.
