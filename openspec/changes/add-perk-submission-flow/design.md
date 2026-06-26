# Design — Paste-a-URL Perk Submission

## Context

MakerPerks is a static Astro site on GitHub Pages with no backend; data is one YAML
file per program, schema-validated in CI, contributed via PR. Cloudflare already
fronts the domain (apex redirect; `www` DNS-only). The contribution capability today
is just a discoverable `CONTRIBUTING.md` + issue forms — fine for git users, a wall
for everyone else. We want a paste-a-URL flow whose only server need is a short-lived
extraction + PR-opening step, which a **Cloudflare Worker** serves without a standing
server. Anti-references: this must not become a spammy submission funnel; the human
review form + PR gate keep quality high.

## Goals / Non-Goals

**Goals:** a non-technical user can add a perk by URL in minutes; extracted data is
reviewable/correctable before submit; submissions land as clean, deduped, schema-valid
PRs; the static no-backend model is preserved; the public endpoint is abuse-resistant;
contribution is visibly promoted.

**Non-Goals:** a database or admin UI; a richer reviewer experience (follow-up); deep
*accuracy* verification of the offer (follow-up); auto-merge (humans review PRs).

## Architecture

```
 visitor ──▶ /contribute (Astro, GitHub Pages)
                │  paste URL + Turnstile token
                ▼
        Worker  POST /extract ── fetch page(s) ─▶ Claude (schema-guided) ─▶ fields JSON
                │                 + dedup check vs perks.json
                ▼  (form pre-filled; user reviews/edits)
        Worker  POST /submit ── validate (schema + scope) ─▶ GitHub App ─▶ PR (YAML)
                                                                   │
                                                          PR review + CI = the queue
```

## Decision 1 — Cloudflare Worker as the agent (two endpoints)

A `worker/` wrangler project, deployed separately from the site. `POST /extract`
takes `{ url, turnstileToken }`, verifies Turnstile, rate-limits per IP (KV/Durable
counter), fetches the page (and obvious sub-pages like a pricing/eligibility link),
reduces to text, and calls Claude. `POST /submit` takes the reviewed record, re-runs
validation server-side (never trust the client), and opens the PR. Short-lived,
pay-per-request, no idle server — exactly the user's constraint. Endpoint host: a
`workers.dev` subdomain initially, with `makerperks.dev` (the reserved agent domain)
as the eventual custom route; the site reads the base URL from a public build var.

## Decision 2 — Claude does schema-guided extraction

The Worker prompts Claude with the canonical field set (from `program.schema.json`)
plus the **scope fence** (builder/dev-adjacent only) and the **audience-accuracy**
rule, and requests structured JSON (tool/`response_format`-style) matching the schema:
`title, provider_slug, url, summary, description, value_type, max_value, currency,
audience[], tags[], region, eligibility`. It returns the fields **plus** per-field
confidence and an "out-of-scope?" flag so the form can highlight low-confidence
values and the flow can refuse consumer/lifestyle perks. `verified` defaults to
today; `sources` to `["makerperks"]`. Claude over Workers AI for structured-output
fidelity on messy marketing pages.

## Decision 3 — GitHub App ("makerperks-bot") opens the PR

A GitHub App scoped to the repo (contents + pull-requests write) authenticates the
Worker via short-lived installation tokens — no personal token, revocable, and PRs
read as from the bot (right for community submissions). `POST /submit` creates a
branch `suggest/<provider>-<slug>`, commits `src/content/programs/<provider>/<slug>.yaml`
(and a `providers/<provider>.yaml` when new), and opens a PR with a templated body
(source URL, submitter note, "agent-extracted, needs review"). Existing CI
(`validate-data`) runs on the PR — the review queue is just the PR list.

## Decision 4 — Guardrails before a PR is ever opened

1. **Dedup:** the Worker fetches the published `perks.json` and checks the candidate's
   `url` domain + provider_slug + title against existing records; a likely duplicate
   is surfaced in the form (link to the existing listing) and blocks silent dupes.
2. **Schema + scope validation:** the same JSON-schema + scope-fence checks CI runs,
   executed in the Worker on submit, so malformed/out-of-scope records never become
   PRs. Deeper *accuracy* verification is a follow-up.

## Decision 5 — Anti-abuse

Cloudflare **Turnstile** (invisible CAPTCHA) on the form, verified server-side on both
endpoints; per-IP **rate limiting** (KV counter or Cloudflare Rate Limiting) caps
Claude/PR cost; the PR gate means nothing publishes without a human. Secrets
(`ANTHROPIC_API_KEY`, GitHub App key, `TURNSTILE_SECRET`) live only as Worker secrets.

## Decision 6 — Promotion UI via `impeccable`

A dismissible site-wide banner (header/top) — "Know a perk builders are missing? Add
it" — and a "Suggest a perk" card at the foot of each listing, both linking to
`/contribute`. Built through `impeccable` on the Trusted-Ledger system: **not** the
Techstars yellow box — our restrained off-white + single green accent. The header
Contribute CTA can point to `/contribute` (with the GitHub guide linked from there for
git users).

## Risks / Trade-offs

- **LLM mis-extraction** → mitigated by the mandatory human review form, server-side
  schema validation, and PR review; low-confidence fields are flagged.
- **Abuse / cost** → Turnstile + rate limit + the PR gate; no auto-merge.
- **Secret leakage** → Worker secrets only; the static site holds no secrets; the
  GitHub App is repo-scoped and revocable.
- **CORS / endpoint coupling** → the Worker allowlists the site origin; the site reads
  the Worker base URL from a public build var so it's environment-swappable.
- **Scope creep into the page** → the extractor enforces the builder/dev-adjacent
  fence and refuses out-of-scope perks before they reach review.

## Open Questions

- Final Worker host: `workers.dev` vs a `makerperks.dev` custom route (DNS to add).
- Whether to also generate the provider `logo` at submit time (reuse the logo-fetch
  script) or leave it to the existing build step. Lean: leave to the build.
- How aggressively to fetch sub-pages during extraction (one hop vs none) — tune for
  cost vs completeness during implementation.
