# Design — Update Footer & Legal

## Context

The footer lives in `src/layouts/Base.astro` (two `<p>`s: a tagline and a meta line
with data links + `© {year}`). It uses `var(--fs-sm)` for the meta line and base size
for the tagline. There are no `/privacy` or `/terms` routes. The site is static Astro
with the "Trusted Ledger" token system; footer is site chrome, which should sit quiet
beneath content.

## Goals / Non-Goals

**Goals:** a quieter, well-structured footer; a feedback channel; working privacy &
terms links backed by real on-site pages; correct attribution.

**Non-Goals:** rewriting header/nav; legally-reviewed policy copy (starter content);
a consent banner; a CMS for the legal pages.

## Decisions

### Decision 1 — Quieter footer, links as a labelled row

Drop the footer to a smaller scale (meta/legal line at `var(--fs-xs)`, tagline at
`var(--fs-sm)`) and group the utility links — Feedback, Privacy, Terms, plus the
existing `perks.json` / `llms.txt` — as a single labelled, wrapping row, keeping the
copyright on its own line. Built through `impeccable` against the token system; muted
ink must still clear 4.5:1 (no light-gray-for-elegance).

### Decision 2 — Real on-site legal pages

Create `/privacy` and `/terms` as Astro pages using the existing `Base` layout, with
honest starter content (what analytics is collected — ties to the Umami change —, no
ads/affiliate, no accounts; standard terms/disclaimer that offers are third-party and
must be confirmed on the provider's site). On-site beats external links: the targets
exist immediately, are versioned in-repo, and match the site's look. The owner edits
the copy; this change does not claim legal review.

### Decision 3 — Feedback via Google Form

The Feedback link points to a Google Form (new tab, `rel="noopener"`). The URL is a
configurable constant filled at implementation; until then a clearly-marked
placeholder so the link is wired but obviously pending.

### Decision 4 — Attribution

Copyright line becomes `© <year> Jazkarta, Inc.` (year already computed in `Base`).

## Risks / Trade-offs

- **Placeholder form URL ships** → mitigate by making the placeholder obvious and
  listing it as the one open input; don't deploy the footer live until it's set.
- **Starter legal copy mistaken for reviewed policy** → add a short in-repo note that
  the copy is a starting point for the owner/counsel to finalize.

## Open Questions

- The exact Google Form URL (owner to provide).
- Whether Privacy should enumerate Umami specifically now or once that change lands —
  lean toward naming it, since both are in flight.
