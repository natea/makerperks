# Tasks — Apollo visitor (company) identification

> **Decision gate before building:** confirm Path A (Apollo pixel + disclosure +
> consent) vs Path C (server-side edge enrichment, no client tracker). Tasks below
> assume **Path A**. The Privacy/Terms copy is content, not a visual design surface;
> any consent-banner UI goes through `impeccable`.

## 1. Config-gated tracker

- [x] 1.1 Read `PUBLIC_APOLLO_APP_ID` (default the provided `6a3fc4051bb840001c7b810d`
  only if you intend it on by default; otherwise leave empty = off) in `Base.astro`
- [x] 1.2 Inject the Apollo tracker before `</head>` only when configured AND consent
  (below) is satisfied; absent on dev/forks

## 2. Consent gate (Path A)

- [x] 2.1 Add a minimal consent mechanism: do not load Apollo until consent is given
  (a small prompt, or geo-gate so consent-required jurisdictions aren't tracked
  pre-consent) — built through `impeccable` if it has UI
- [x] 2.2 Persist the consent choice; Umami (cookieless) stays consent-free

## 3. Disclosure (required)

- [x] 3.1 Update `src/pages/privacy.astro`: disclose that a third-party service
  (Apollo) identifies some visitors' company via IP, and that the request IP is shared
  with that processor; reconcile the "no marketing trackers / no third-party sharing"
  language
- [x] 3.2 Update `src/pages/terms.astro` accordingly

## 4. Verify

- [x] 4.1 Built site loads Apollo only when configured AND consented; not on dev/forks
- [x] 4.2 Privacy Policy + Terms accurately describe the tracker (no longer claim "no
  marketing trackers / no third-party sharing" without qualification)
- [x] 4.3 Umami still runs cookielessly; consent gate works; disable (empty config)
  removes the script
- [x] 4.4 `openspec validate add-apollo-visitor-tracking --strict` passes; typecheck,
  lint, build green

## 5. Alternative to evaluate first (OUT OF SCOPE if Path A chosen)

> Plain note, not a checkbox.

- Path C: server-side IP→company enrichment at the Cloudflare Worker/edge — no client
  tracker, no cookies, no consent banner; still disclose. Likely the better fit for a
  privacy-positioned site; evaluate before committing to the Apollo pixel.
