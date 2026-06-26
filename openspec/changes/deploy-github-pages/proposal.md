## Why

The site builds in CI but has no deploy step and no live home. We want it published at
`www.makerperks.com` on GitHub Pages (free, static, matches the PR-editable model),
with the apex `makerperks.com` redirecting to the `www` canonical host so there's one
true URL for links, SEO, and social cards.

## What Changes

- **Deploy to GitHub Pages via GitHub Actions** — a workflow that builds the Astro
  site (full git history for the date derivation) and publishes it through the
  official Pages deploy actions on every push to `main`.
- **Serve at the `www` custom domain** — commit a `public/CNAME` of
  `www.makerperks.com` and set `site` to `https://www.makerperks.com` so canonical
  URLs, the sitemap, `perks.json`, and social/OG absolute URLs all resolve to the
  live host.
- **Redirect apex → www at Cloudflare** — `www` is a DNS-only CNAME to GitHub Pages
  (GitHub terminates TLS); the apex `makerperks.com` is redirected (301, path/query
  preserved) to `https://www.makerperks.com` via a Cloudflare redirect rule.
- **Enforce HTTPS** on GitHub Pages.

## Capabilities

### New Capabilities

- `deployment`: the build-and-publish pipeline and the canonical-domain behavior
  (Pages deploy, `www` custom domain, apex→www redirect, HTTPS).

### Modified Capabilities

(none — there is no prior deployment spec.)

## Impact

- **Affected code:** new `.github/workflows/deploy.yml`; new `public/CNAME`;
  `astro.config.mjs` `site` → `https://www.makerperks.com`.
- **Toolchain:** mirrors `ci.yml` — bun, `fetch-depth: 0` (required for the
  `added`/`updated` git-date derivation). The lockfile must include all current deps
  (e.g. `fuse.js`) or `--frozen-lockfile` fails.
- **External setup (dashboard runbook, not code):** GitHub Pages source = GitHub
  Actions, custom domain `www.makerperks.com`, Enforce HTTPS; Cloudflare DNS (`www`
  CNAME → `<org>.github.io`, DNS-only) + a Single Redirect rule for the apex.
- **Cross-change:** setting `site` to `www` is what makes `add-social-share-meta`'s
  absolute OG/Twitter URLs correct; they compose.
- **Non-goals:** no preview-deploy per PR; no custom CDN/edge logic beyond the apex
  redirect; no move off GitHub Pages.
