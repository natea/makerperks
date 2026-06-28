## Why

Listings rot silently: a provider retires a program, changes its URL, or quietly drops
the credit amount — and our page keeps showing the old, now-wrong offer. The whole
value of MakerPerks is being **current and trustworthy**, so stale or dead listings are
the most damaging failure mode. Today nothing checks: `verified` dates drift, redeem
links 404, and we only find out when a user complains. We need an automated, recurring
sweep that flags broken links and likely-stale data — without ever silently rewriting
published records.

## What Changes

- **A scheduled freshness check** (a GitHub Actions cron, e.g. weekly) runs a script
  that, for every published program, (a) verifies the redeem `url` and any tier
  `action_url`s still **resolve** (HTTP-reachable, not a 4xx/5xx, not redirected off to
  an unrelated/parked domain), and (b) flags records whose `verified` date is **older
  than a staleness threshold**.
- **Findings are surfaced as a pull request, never applied on the fly.** The job writes
  a committed **health report** and opens (or updates) a single PR listing dead links
  and stale records for a maintainer to review and act on. Nothing publishes, and no
  `verified` date is ever auto-bumped — a fresh `verified` date must reflect a real
  human re-check, not a script run.
- **Deterministic, cheap signals first.** v1 covers link-health + staleness (no LLM
  cost). Deeper *content drift* detection (did the offer's value/eligibility change?)
  is noted as a deliberate follow-up.

## Capabilities

### New Capabilities

(none — extends `program-data`.)

### Modified Capabilities

- `program-data`: add **automated freshness and link-health monitoring** — a recurring
  check that flags dead redeem links and stale `verified` dates and reports them for
  human review, keeping the published data honest without silent edits.

## Impact

- **Affected specs:** `program-data` (added requirement).
- **New code:** `scripts/check-perk-health.mjs` (the checker, reusing the YAML loader),
  a `.github/workflows/freshness.yml` scheduled workflow, and a committed report under
  `reports/`. May add a review-oriented `status` value or a `community_notes` flag for
  flagged records.
- **Auth:** the PR is opened by the existing `makerperks-bot` GitHub App (or the
  workflow's `GITHUB_TOKEN`); read-only checks, no new secrets in the repo.
- **Non-goals / follow-ups:** LLM-based content-drift detection (value/eligibility
  changed); auto-merging fixes; scraping behind logins; checking the aggregator
  `unlocks` graph. The static, PR-reviewed model is preserved — the checker only ever
  *proposes*.
