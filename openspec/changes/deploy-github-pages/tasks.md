# Tasks — Deploy to GitHub Pages (www) + Cloudflare apex redirect

> Infrastructure/build change — no UI design surface, so `impeccable` is not required.
> Tasks marked **(dashboard)** are manual console steps, not repo edits; do them in
> the stated order (DNS → cert → enforce HTTPS).

## 1. Repo — build config

- [ ] 1.1 Set `site: "https://www.makerperks.com"` in `astro.config.mjs` (no `base` —
  custom domain serves at root)
- [ ] 1.2 Add `public/CNAME` containing exactly `www.makerperks.com`
- [ ] 1.3 Refresh the bun lockfile (`bun install`) so it includes all current deps
  (e.g. `fuse.js`) and commit it, so `--frozen-lockfile` succeeds in CI/deploy

## 2. Repo — deploy workflow

- [ ] 2.1 Add `.github/workflows/deploy.yml`: trigger on push to `main` +
  `workflow_dispatch`; `permissions: pages: write, id-token: write`; `concurrency`
  group `pages`
- [ ] 2.2 Build job mirrors `ci.yml`: `actions/checkout@v4` with `fetch-depth: 0`,
  `oven-sh/setup-bun`, `bun install --frozen-lockfile`, `bun run build`
- [ ] 2.3 Publish job: `actions/configure-pages` → `actions/upload-pages-artifact`
  (path `./dist`) → `actions/deploy-pages`, on the `github-pages` environment

## 3. GitHub Pages (dashboard)

- [ ] 3.1 Repo Settings → Pages → Source = **GitHub Actions**
- [ ] 3.2 Set custom domain to `www.makerperks.com` (confirm it matches `public/CNAME`)
- [ ] 3.3 After the cert provisions, enable **Enforce HTTPS**

## 4. Cloudflare (dashboard)

- [ ] 4.1 DNS: `www` CNAME → `<org>.github.io` (assume `makerperks.github.io`;
  confirm org), **DNS-only / grey cloud** so GitHub terminates TLS
- [ ] 4.2 DNS: apex record present and **proxied** so Cloudflare can act on it
- [ ] 4.3 Single Redirect rule: when host = `makerperks.com`, `301` to
  `concat("https://www.makerperks.com", http.request.uri.path)` + preserve query
  string

## 5. Verify

- [ ] 5.1 Push to `main` → the deploy workflow runs green and Pages shows the new build
- [ ] 5.2 `https://www.makerperks.com` serves with a valid cert; sitemap / `perks.json`
  / OG URLs use the `www` host
- [ ] 5.3 `https://makerperks.com/<path>?<q>` 301-redirects to the same path/query on
  `www`
- [ ] 5.4 Build log shows no `record-dates` shallow-clone fallback (full history works)
- [ ] 5.5 `openspec validate deploy-github-pages --strict` passes
