# Tasks — Automated perk freshness & link-health checks

> Backend/CI/data change (a Node script + a scheduled workflow + a markdown report) —
> no site design surface, so `impeccable` is not required.
>
> **Decisions (from design):** scheduled GitHub Action · check link-health + staleness
> (deterministic, no LLM in v1) · **flag via PR, never auto-update** · report committed
> under `reports/` · content-drift detection is a follow-up.

## 1. Health-check script

- [x] 1.1 Add `scripts/check-perk-health.mjs` reusing the YAML loader from
  `validate-data.mjs`; iterate every published (non-draft) program
- [x] 1.2 Collect the URLs to check per program: the redeem `url` plus each tier
  `action_url`; de-dupe

## 2. Link-health checks

- [x] 2.1 HTTP-check each URL (GET, descriptive User-Agent, timeout, single retry);
  classify as ok / broken (conn fail, 4xx/5xx) / redirected-off-domain / unknown
- [x] 2.2 Politeness: bounded concurrency and per-host courtesy; never hammer a provider
- [x] 2.3 Redirect heuristic: compare the final response's registrable domain to the
  original; flag only when it lands on an unrelated/parked host

## 3. Staleness check

- [x] 3.1 Flag programs whose `verified` date is older than a configurable threshold
  (default ~120 days)

## 4. Report output

- [x] 4.1 Write a human-readable `reports/data-health.md` (table: program, issue, URL,
  observed status, last verified) and a machine-readable `reports/data-health.json`
- [x] 4.2 A clean run updates the report to "all healthy" rather than emitting noise;
  `verified` dates are never modified by the script

## 5. Scheduled workflow → PR

- [x] 5.1 Add `.github/workflows/freshness.yml` on a weekly `schedule:` +
  `workflow_dispatch`; runs the script
- [x] 5.2 Open/update a single stable PR (e.g. branch `bot/freshness`) with the report
  and a summary of new vs. recurring issues; never auto-merge
- [x] 5.3 (Optional, behind the same PR) propose minimal reviewable flags for clearly
  dead links (`status`/`community_notes`); never touch `verified`

## 6. Verify

- [x] 6.1 Run the script locally against the real data → produces a correct report;
  a deliberately-broken test URL is flagged, a fresh record is not
- [x] 6.2 Stale-date flagging triggers on a record older than the threshold and not on a
  recent one
- [x] 6.3 The workflow opens a PR with the report; existing CI `validate-data` passes on
  it; nothing is auto-merged and no `verified` date changes
- [x] 6.4 `openspec validate add-perk-freshness-checks --strict` passes; lint/typecheck
  green

## 7. Follow-ups (OUT OF SCOPE — not tracked here)

> Plain notes, not checkboxes.

- LLM content-drift detection (did the offer's value/eligibility actually change).
- Auto-proposing corrected values; auto-merging.
- Checking the aggregator `unlocks` graph and login-gated pages.
