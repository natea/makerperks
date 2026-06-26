## Why

The directory grows through community contributions, but today the only way to add a
perk is to open a GitHub PR editing YAML by hand. That gates contribution to
technical users who know git, leaving out the many builders who simply *know about* a
perk. We also don't actively promote contributing. To grow, we need to (1) promote
contribution prominently and (2) make adding a perk as easy as pasting a URL.

## What Changes

- **Paste-a-URL submission.** A `/contribute` flow where a non-technical user pastes a
  program's URL; a short-lived **Cloudflare Worker agent** fetches the page(s) and
  uses Claude to extract the listing metadata into our schema.
- **Review-before-submit form.** The extracted fields are shown in an editable form so
  the user can correct anything before submitting — nothing is published blindly.
- **PRs as the review queue.** On submit, the Worker (a `makerperks-bot` GitHub App)
  opens a pull request adding the YAML record(s). PR review + existing CI validation is
  the moderation gate; no database is introduced.
- **Pre-submit guardrails.** Detect duplicates against existing records and validate
  against the JSON schema + scope fence before opening a PR, so reviewers get clean,
  non-duplicate submissions. Cloudflare **Turnstile** + rate limiting protect the
  public endpoint.
- **Promotion.** A site-wide banner and a "Suggest a perk" card at the bottom of
  listings drive contributors into the flow (built via `impeccable`).

## Capabilities

### New Capabilities

(none — extends the existing contribution capability.)

### Modified Capabilities

- `contribution`: add a low-friction, non-technical submission path (paste URL →
  agent-extract → review form → PR review queue), pre-submit dedup + schema/scope
  validation, abuse protection, and on-site promotion of contributing.

## Impact

- **Affected specs:** `contribution` (added requirements).
- **New code:** a `worker/` Cloudflare Worker (wrangler) with `POST /extract`
  (URL → metadata via Claude) and `POST /submit` (reviewed metadata → GitHub PR via
  the GitHub App), plus dedup + schema validation; an Astro `/contribute` flow page
  and the promotion surfaces in `src/layouts/Base.astro` / listing pages.
- **Secrets (Worker only, never committed):** `ANTHROPIC_API_KEY`, the GitHub App
  credentials (app id / private key / installation id), `TURNSTILE_SECRET`.
- **Non-goals / follow-ups (explicit):** a richer in-app reviewer experience (scanning
  a listing for errors) and deep *accuracy* verification (confirming the offer is real
  and current) are **out of scope** here; PR review + schema validation are the v1 gate.
  No backend/database; the static, PR-editable model is preserved.
