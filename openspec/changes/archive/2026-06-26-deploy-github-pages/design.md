# Design — Deploy to GitHub Pages (www) + Cloudflare apex redirect

## Context

Static Astro site, no deploy yet. `ci.yml` already builds with bun and
`fetch-depth: 0` (the `added`/`updated` dates derive from full git history).
`astro.config.mjs` `site` is `https://makerperks.com`. The repo lives under the
`makerperks` GitHub org (the Contribute link). DNS is on Cloudflare. We want one
canonical host (`www`) and the apex redirecting to it.

## Goals / Non-Goals

**Goals:** automated publish on push to `main`; correct git-date derivation in the
deploy build; one canonical host; valid TLS on `www`; apex 301→www preserving path.

**Non-Goals:** per-PR preview deploys; moving off Pages; edge functions; changing the
build itself.

## Decisions

### Decision 1 — GitHub Actions Pages deploy, mirroring ci.yml

A `deploy.yml` on push to `main` (+ `workflow_dispatch`) using the official flow:
`actions/checkout@v4` (**`fetch-depth: 0`** — same reason as CI: the date sort is
wrong on a shallow clone), `oven-sh/setup-bun`, `bun install --frozen-lockfile`,
`bun run build`, then `actions/configure-pages` → `actions/upload-pages-artifact`
(`./dist`) → `actions/deploy-pages`, with `permissions: pages: write, id-token:
write` and a `github-pages` environment. Bun (not npm) matches CI so one toolchain
governs both.

_Alternatives:_ branch-based `gh-pages` push (older, needs a token, no native
environment) — rejected in favor of the first-party Pages actions.

### Decision 2 — `site` = www, committed `CNAME`, no `base`

Set `site: "https://www.makerperks.com"` and commit `public/CNAME` containing
`www.makerperks.com` (Astro copies `public/` to the output root, which is what Pages
reads for the custom domain). Because the custom domain serves at the host root, **no
`base`** is needed (unlike a `user.github.io/repo` project page). `site` drives the
sitemap, `perks.json` `homepage`, canonical URLs, and `add-social-share-meta`'s
absolute OG image/URL — all must point at the live host.

### Decision 3 — `www` DNS-only, apex redirected at Cloudflare

- **`www`**: a **DNS-only** (grey-cloud) CNAME → `<org>.github.io`
  (`makerperks.github.io`). DNS-only lets **GitHub Pages terminate TLS** with its own
  Let's Encrypt cert; proxying `www` through Cloudflare onto Pages invites the classic
  Cloudflare↔Pages TLS/redirect loop. (If proxying is later wanted, SSL mode must be
  Full and the Pages cert kept valid.)
- **apex `makerperks.com`**: handled entirely by Cloudflare — a proxied placeholder
  record plus a **Single Redirect** rule: `301`, match host `makerperks.com`, target
  `https://www.makerperks.com` concatenated with the original path and query, so deep
  links survive the redirect.

### Decision 4 — Enforce HTTPS + domain verification

After the custom domain resolves and GitHub provisions the cert, enable **Enforce
HTTPS** in Pages. Optionally verify the domain in GitHub org settings to prevent
takeover. Order matters: set DNS first, let the cert issue, then enforce HTTPS.

## Risks / Trade-offs

- **Cloudflare-proxied `www` → TLS loop / 525s** → mitigation: `www` DNS-only so
  GitHub serves TLS directly. Documented as the default.
- **Shallow clone in deploy → wrong/duplicate dates** → `fetch-depth: 0`, same as CI.
- **`--frozen-lockfile` fails because the lockfile lacks a dep (e.g. `fuse.js` added
  recently via npm)** → before first deploy, run `bun install` to refresh the bun
  lockfile so it matches `package.json`; commit it.
- **Enforcing HTTPS before the cert is issued** → Pages shows a TLS error; enable it
  only after the cert provisions (can take up to ~24h after DNS).
- **Apex redirect dropping path/query** → use Cloudflare's dynamic target
  (`concat("https://www.makerperks.com", http.request.uri.path)` + query), not a
  static URL.

## Open Questions

- The exact GitHub org/repo slug for the `CNAME` target (`makerperks.github.io`
  assumed from the Contribute link — confirm at apply).
- Whether the apex should also be reachable directly (it won't be — it only redirects),
  which is the intended behavior.
