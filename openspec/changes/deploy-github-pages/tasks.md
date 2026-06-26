# Tasks — Deploy to GitHub Pages (www) + Cloudflare apex redirect

> Infrastructure/build change — no UI design surface, so `impeccable` is not required.
> Repo owner resolved to **natea/makerperks** (Pages domain `natea.github.io`).
> Tasks marked **(dashboard)** are console steps; do them in order (DNS → cert →
> enforce HTTPS).

## 1. Repo — build config

- [x] 1.1 Set `site: "https://www.makerperks.com"` in `astro.config.mjs` (no `base` —
  custom domain serves at root)
- [x] 1.2 Add `public/CNAME` containing exactly `www.makerperks.com`
- [x] 1.3 Refresh the bun lockfile (`bun install`) so it includes all current deps
  (fuse/satori/resvg) and commit it, so `--frozen-lockfile` succeeds in CI/deploy

## 2. Repo — deploy workflow

- [x] 2.1 Add `.github/workflows/deploy.yml`: trigger on push to `main` +
  `workflow_dispatch`; `permissions: pages: write, id-token: write`; `concurrency`
  group `pages`
- [x] 2.2 Build job mirrors `ci.yml`: `actions/checkout@v4` with `fetch-depth: 0`,
  `oven-sh/setup-bun`, `bun install --frozen-lockfile`, `bun run build`
- [x] 2.3 Publish job: `actions/configure-pages` → `actions/upload-pages-artifact`
  (path `./dist`) → `actions/deploy-pages`, on the `github-pages` environment

## 3. GitHub Pages (dashboard / API)

- [x] 3.1 Pages Source = **GitHub Actions** (set via `gh api ... -f build_type=workflow`)
- [x] 3.2 Custom domain set to `www.makerperks.com` (matches `public/CNAME`)
- [ ] 3.3 Enable **Enforce HTTPS** once the GitHub cert finishes provisioning
  (`cert_state: new` at deploy time; auto-issues within ~15 min of DNS going live)

## 4. Cloudflare (done via API token)

- [x] 4.1 DNS: `www` CNAME → `natea.github.io`, **DNS-only / grey cloud** (resolves to
  GitHub Pages IPs `185.199.108.153` …)
- [x] 4.2 DNS: apex `makerperks.com` A → `192.0.2.1`, **proxied** (placeholder; origin
  never used)
- [x] 4.3 Single Redirect rule: host `makerperks.com` → `301`
  `wildcard_replace(... https://www.makerperks.com/${1})`, `preserve_query_string: true`

## 5. Verify

- [x] 5.1 Push to `main` → the deploy workflow ran green; Pages published the build
- [x] 5.2 `http://www.makerperks.com` serves the site; OG images + pages load on the
  `www` host (HTTPS pending the auto cert)
- [x] 5.3 `makerperks.com/<path>?<q>` 301-redirects to the same path+query on `www`
  (verified live)
- [x] 5.4 Build log shows no `record-dates` shallow-clone fallback (full history works)
- [x] 5.5 `openspec validate deploy-github-pages --strict` passes
