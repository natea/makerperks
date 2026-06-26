## Why

MakerPerks ships with no usage analytics, so we can't see which personas, programs,
or referrers actually drive value — we're flying blind on the directory's core job.
We want that signal without betraying the product's trust promise: no ad trackers,
no cookie banner, no selling visitors' data.

## What Changes

- **Add Umami (Cloud) analytics** site-wide via a single lightweight, cookieless
  script injected in the shared `<head>` (`src/layouts/Base.astro`).
- **Config-driven, opt-in by presence.** The script loads only when a website ID is
  configured (`PUBLIC_UMAMI_WEBSITE_ID`); with no ID set (local dev, forks, PR
  previews) nothing loads and the build is unaffected. Script source defaults to
  Umami Cloud and is overridable via `PUBLIC_UMAMI_SRC`.
- **Privacy-respecting by construction.** Cookieless, no personal data, no consent
  banner required; honors Do Not Track. Consistent with the "no ads / no affiliate"
  ethos.
- **No app or content changes.** Pure instrumentation; no UI surface, no data model
  change.

## Capabilities

### New Capabilities

- `site-analytics`: privacy-respecting, cookieless usage analytics loaded site-wide,
  enabled by configuration and absent when unconfigured.

### Modified Capabilities

(none)

## Impact

- **Affected specs:** `site-analytics` (new).
- **Affected code:** `src/layouts/Base.astro` (conditional script tag in `<head>`).
- **Config:** `PUBLIC_UMAMI_WEBSITE_ID` (required to enable) and optional
  `PUBLIC_UMAMI_SRC` (defaults to `https://cloud.umami.is/script.js`), read from the
  environment at build. Public by nature (the website ID ships in client HTML); no
  secret is involved.
- **Privacy:** no cookies, no PII, no consent gate; honors DNT.
