# Design — Automated perk freshness & link-health checks

## Context

MakerPerks is a static, no-backend site: one schema-validated YAML file per program,
contributed and edited through PRs, with `verified` recording when a human last checked
the offer. The product promise is *current + trustworthy*, so the highest-value
maintenance task is catching listings that have gone stale or dead. We already have the
infrastructure to do this cleanly: GitHub Actions CI, a YAML loader, and (from the
contribution flow) a `makerperks-bot` App that opens PRs. This change adds a recurring
sweep on top of that — deliberately *advisory*, never silently mutating data.

## Goals / Non-Goals

**Goals:** automatically catch dead redeem links and stale `verified` dates across all
programs; surface findings for a human to act on; zero new standing infra; never
publish or fabricate freshness without human review; cheap to run.

**Non-Goals:** LLM content-drift detection (did the value/eligibility actually change);
auto-fixing or auto-merging; logged-in/scraped pages; verifying the aggregator
`unlocks` graph; replacing human re-verification.

## Decision 1 — A scheduled GitHub Action, not a service

A `.github/workflows/freshness.yml` running on `schedule:` (weekly cron) plus
`workflow_dispatch` for on-demand runs. It executes `scripts/check-perk-health.mjs`
(Node, reusing the same YAML parsing as `validate-data.mjs`). This fits the
no-backend/static model, costs nothing at idle, and keeps everything in the repo. (The
contribute Cloudflare Worker is for per-request user actions; a batch sweep belongs in
CI.)

## Decision 2 — What we check (deterministic, cheap signals)

1. **Link health.** For each program: HTTP-check the redeem `url` and every tier
   `action_url`. Use a GET with a real User-Agent and a timeout; treat as broken on
   connection failure, 4xx/5xx, or a redirect whose final host is unrelated to the
   original (parked/for-sale/marketing-home). Be polite: cap concurrency, retry once.
2. **Staleness.** Flag any program whose `verified` is older than a threshold
   (default ~120 days; configurable). Purely date math, no network.
3. **(Follow-up) Content drift.** Fetching each page and asking Claude whether the
   value/eligibility changed is the natural next layer, but it adds LLM cost + noise
   and needs careful prompting — out of scope for v1, noted explicitly.

## Decision 3 — Flag via PR, never update on the fly (the key choice)

**Findings are delivered as a pull request and reviewed by a human; nothing is applied
automatically.** This is the same posture as the contribution flow (PRs are the review
queue) and is required by the data ethos:

- A `verified` date must reflect a *real* human re-check. A script bumping it on a
  successful link ping would manufacture false confidence — exactly the dishonesty the
  product exists to avoid.
- A 200 response does not mean the *offer* is unchanged (the page can be live but the
  credit halved). So even "the link works" is not grounds to silently mark a record
  fresh.
- Auto-editing published content with no review risks corrupting the dataset from a
  flaky check (transient 503, geo-block, bot-wall).

So the job **proposes**, a maintainer **decides**. On-the-fly auto-update is explicitly
rejected.

## Decision 4 — What the PR contains

Each run (when there is anything to report):

- Writes/updates a committed **report** at `reports/data-health.md` (human-readable
  table: program, issue, URL, status, last-verified) and a machine-readable
  `reports/data-health.json` for trend/diffing. Committing it means history lives in
  git and the PR diff shows what newly broke since last run.
- Opens or updates a single PR (stable branch like `bot/freshness`) titled e.g.
  "Data health: N broken links, M stale". The PR body summarizes new vs. recurring
  issues. Existing CI `validate-data` runs on it.
- Optionally proposes **minimal, reviewable flags** for clearly-dead links (e.g. set
  `status: Discontinued` or add a `community_notes` "link unreachable on <date>")
  — still gated behind the maintainer merging. It never touches `verified`.

A clean run updates the report to "all healthy" and opens no change beyond that, to
avoid noise.

## Decision 5 — Auth & politeness

The workflow opens the PR with the repo `GITHUB_TOKEN` (or the `makerperks-bot` App if
cross-checks need it). Checks are read-only outbound requests with a descriptive
User-Agent, bounded concurrency, per-host courtesy, and a single retry; failures to
*check* (our network) are reported as "unknown", not "broken".

## Risks / Trade-offs

- **False positives** (bot-walls, geo-blocks, rate limits, transient 5xx) → retry once,
  mark ambiguous results "needs manual check" rather than "broken"; humans review.
- **Provider redirect heuristics** are fuzzy (a legit `?ref=` redirect vs. a parked
  domain) → compare final host to original registrable domain; when unsure, flag softly.
- **PR noise** → one stable PR/branch updated in place; clean runs don't spam.
- **Cost/time** → ~200 HTTP checks weekly is trivial; no LLM calls in v1.

## Open Questions

- Staleness threshold (90 / 120 / 180 days), and whether it varies by program type.
- Report-only PR vs. PR that also proposes `status`/note edits for dead links (lean:
  start report-only, add proposed flags once the false-positive rate is known).
- Whether to also open a GitHub **Issue** for the digest (some teams prefer issues for
  "to-do" triage) — or keep everything in the single PR.
