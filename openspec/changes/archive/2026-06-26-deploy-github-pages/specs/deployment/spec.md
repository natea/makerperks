# Deployment

## ADDED Requirements

### Requirement: Automated GitHub Pages deploy

The site SHALL be built and published to GitHub Pages by a GitHub Actions workflow on
every push to `main`. The deploy build SHALL check out the full git history so the
build-time `added`/`updated` date derivation is correct, and SHALL use the same
package manager and lockfile discipline as CI.

#### Scenario: Push to main publishes the site

- **WHEN** a commit lands on `main`
- **THEN** the workflow builds the site and deploys the output to GitHub Pages

#### Scenario: Full history for date derivation

- **WHEN** the deploy workflow checks out the repository
- **THEN** it uses full history (`fetch-depth: 0`) so date sorts are not degraded to
  the verified-date fallback

### Requirement: Canonical www host

The site SHALL be served at `https://www.makerperks.com` as its canonical host: a
committed `CNAME` SHALL set the Pages custom domain to `www.makerperks.com`, and the
configured `site` SHALL be `https://www.makerperks.com` so the sitemap, data
endpoints, canonical URLs, and social/OG absolute URLs resolve to that host. HTTPS
SHALL be enforced.

#### Scenario: Custom domain serves the site over HTTPS

- **WHEN** a visitor loads `https://www.makerperks.com`
- **THEN** the site is served with a valid certificate
- **AND** generated absolute URLs (sitemap, `perks.json` homepage, OG image/url) use
  the `www` host

### Requirement: Apex redirects to www

The apex `makerperks.com` SHALL `301`-redirect to `https://www.makerperks.com`,
preserving the request path and query string, via Cloudflare.

#### Scenario: Apex deep link redirects

- **WHEN** a visitor requests `http(s)://makerperks.com/<path>?<query>`
- **THEN** they receive a 301 to `https://www.makerperks.com/<path>?<query>`
