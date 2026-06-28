# Tasks — Paste-a-URL Perk Submission

> **Design rule:** the `/contribute` flow UI, the banner, and the "suggest a perk"
> card are design surfaces and MUST be built through the `impeccable` skill. The Worker,
> extraction, validation, and PR plumbing are backend/data and exempt.
>
> **Decisions (from proposal):** Claude API extraction · GitHub App bot for PRs ·
> Turnstile + rate limit · dedup + schema now, deep accuracy/reviewer UX as follow-up.

## 1. Cloudflare Worker — scaffold

- [x] 1.1 Add a `worker/` wrangler project (TypeScript); config for routes, KV (rate
  limit), and secret bindings; document `wrangler deploy`
- [x] 1.2 CORS allowlist for the site origin(s); reject other origins
- [x] 1.3 Turnstile verification + per-IP rate limiting on every endpoint (reject
  before any fetch/LLM/PR work)

## 2. Extraction endpoint (`POST /extract`)

- [x] 2.1 Fetch the submitted URL (and at most one obvious sub-page, e.g. pricing/
  eligibility); reduce to clean text
- [x] 2.2 Call Claude with the `program.schema.json` field set + scope fence +
  audience-accuracy rule; request structured JSON for the listing fields
- [x] 2.3 Return fields + per-field confidence + an out-of-scope flag; default
  `verified` to today and `sources` to `["makerperks"]`
- [x] 2.4 Dedup: fetch published `perks.json`, match candidate URL-domain / provider /
  title against existing records, return any likely duplicate

## 3. Submit endpoint (`POST /submit`) — GitHub App PR

- [ ] 3.1 Create the `makerperks-bot` GitHub App (contents + pull-requests write,
  repo-scoped); store app id / private key / installation id as Worker secrets
- [x] 3.2 Re-validate the reviewed record server-side against the JSON schema + scope
  fence; reject (no PR) on failure
- [x] 3.3 Open a branch + PR adding `src/content/programs/<provider>/<slug>.yaml`
  (and `providers/<provider>.yaml` if new) via short-lived installation token; PR body
  records source URL + "agent-extracted, needs review"

## 4. Contribute flow — via `/impeccable`

- [x] 4.0 Build the flow surfaces through impeccable; browser-verify
- [x] 4.1 `/contribute` page: paste-URL step (with Turnstile) → calls `/extract`
- [x] 4.2 Review form: all schema fields pre-filled + editable; flag low-confidence
  fields; show any duplicate match; link the GitHub guide for git users
- [x] 4.3 Submit → `/submit`; success state links to the opened PR; clear error states

## 5. Promotion — via `/impeccable`

- [ ] 5.1 Dismissible site-wide banner leading to `/contribute` (Trusted-Ledger
  styling, not an off-brand yellow box)
- [ ] 5.2 "Suggest a perk" card at the end of program listings → `/contribute`
- [ ] 5.3 Point the header Contribute CTA at `/contribute` (GitHub guide linked from there)

## 6. Config & secrets

- [ ] 6.1 Worker secrets: `ANTHROPIC_API_KEY`, GitHub App credentials,
  `TURNSTILE_SECRET` (via `wrangler secret`; never committed)
- [x] 6.2 Public build var for the Worker base URL (e.g. `PUBLIC_CONTRIBUTE_API`),
  documented in `.env.example`

## 7. Verify

- [ ] 7.1 Paste a real program URL → fields extracted, scope-fence refusal works on a
  consumer URL, low-confidence fields flagged
- [ ] 7.2 Edit + submit → a PR is opened with valid YAML; CI `validate-data` passes on it
- [ ] 7.3 Duplicate URL is caught pre-submit; invalid record is rejected with no PR
- [ ] 7.4 Endpoint rejects missing/invalid Turnstile token and over-rate-limit calls
- [ ] 7.5 `openspec validate add-perk-submission-flow --strict` passes; site typecheck +
  build green; Worker builds/deploys

## 8. Follow-ups (OUT OF SCOPE — not tracked here)

> Plain notes, not checkboxes, so they don't gate completion.

- Richer reviewer experience (scan a listing for errors, inline diff review).
- Deep accuracy verification (confirm the offer/value is real and current).
- Auto-generate the provider logo at submit time (currently handled by the build).
