# MakerPerks contribute Worker

The server side of the **paste-a-URL** perk submission flow. A Cloudflare Worker with
two endpoints; no standing server, no database.

- `POST /extract` — `{ url, turnstileToken }` → fetches the page, asks Claude to map it
  onto the program schema (per-field confidence + an out-of-scope flag), and checks for
  duplicates against the published `perks.json`.
- `POST /submit` — `{ record, turnstileToken, note?, providerNew?, providerName? }` →
  re-validates server-side (schema + scope), then opens a GitHub PR adding the YAML via
  the `makerperks-bot` App. **Nothing is auto-published** — the PR is the review queue.
- `GET /` — plain-text help.

Abuse protection runs **before** any fetch/LLM/PR work: Cloudflare Turnstile
verification + a per-IP rate limit (`[[ratelimits]]`, 10/60s). CORS is allowlisted to
the site origins (`ALLOWED_ORIGINS`).

## Develop & test

```sh
cd worker
npm install
npm test          # dedup unit tests (node:test, no deploy needed)
npm run typecheck
npm run build     # wrangler dry-run (bundle check)
npm run dev       # local: http://localhost:8787
```

## One-time setup before deploy

### 1. Create the `makerperks-bot` GitHub App

GitHub → Settings → Developer settings → **GitHub Apps → New GitHub App**:

- Repository permissions: **Contents: Read & write**, **Pull requests: Read & write**.
- No webhook needed. Generate a **private key** (downloads a `.pem`).
- **Install** the App on the `natea/makerperks` repo; note the **installation id**
  (in the install URL: `.../installations/<id>`).

GitHub issues a **PKCS#1** key (`BEGIN RSA PRIVATE KEY`); the Worker uses Web Crypto,
which needs **PKCS#8**. Convert it:

```sh
openssl pkcs8 -topk8 -nocrypt -in makerperks-bot.private-key.pem -out key.pkcs8.pem
```

### 2. Create a Turnstile widget

Cloudflare dashboard → **Turnstile → Add site** (domain `makerperks.com`). You get a
**site key** (public — goes in the site build as `PUBLIC_TURNSTILE_SITE_KEY`) and a
**secret key** (Worker secret `TURNSTILE_SECRET`).

### 3. Set Worker secrets (never committed)

```sh
cd worker
wrangler secret put ANTHROPIC_API_KEY
wrangler secret put TURNSTILE_SECRET
wrangler secret put GH_APP_ID
wrangler secret put GH_APP_INSTALLATION_ID
wrangler secret put GH_APP_PRIVATE_KEY     # paste the PKCS#8 PEM contents
```

Non-secret config lives in `wrangler.toml` (`ALLOWED_ORIGINS`, `PERKS_JSON_URL`,
`GITHUB_REPO`, `GITHUB_BASE_BRANCH`, `ANTHROPIC_MODEL`).

## Deploy

```sh
cd worker
npm run deploy            # wrangler deploy
```

By default it deploys to the `*.workers.dev` URL. To use a custom route
(`api.makerperks.dev`), uncomment the `[[routes]]` block in `wrangler.toml` (requires
that zone on the Cloudflare account). Then point the site at the deployed URL via the
`PUBLIC_CONTRIBUTE_API` build var (see the site's `.env.example`).
