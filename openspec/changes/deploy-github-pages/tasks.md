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
- [ ] 3.3 After Cloudflare DNS resolves and the cert provisions, enable **Enforce HTTPS**

## 4. Cloudflare (dashboard — OWNER ACTION, no API token available to the agent)

- [ ] 4.1 DNS: `www` CNAME → `natea.github.io`, **DNS-only / grey cloud** so GitHub
  terminates TLS
- [ ] 4.2 DNS: apex `makerperks.com` record present and **proxied** so Cloudflare can
  act on it
- [ ] 4.3 Single Redirect rule: when host = `makerperks.com`, `301` to
  `concat("https://www.makerperks.com", http.request.uri.path)` + preserve query

## 5. Verify

- [x] 5.1 Push to `main` → the deploy workflow ran green; Pages published the build
- [ ] 5.2 `https://www.makerperks.com` serves with a valid cert; sitemap / `perks.json`
  / OG URLs use the `www` host (pending DNS)
- [ ] 5.3 `https://makerperks.com/<path>?<q>` 301-redirects to the same path/query on
  `www` (pending Cloudflare rule)
- [x] 5.4 Build log shows no `record-dates` shallow-clone fallback (full history works)
- [x] 5.5 `openspec validate deploy-github-pages --strict` passes
