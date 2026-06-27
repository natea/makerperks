# Design — Apollo visitor (company) identification

## Context

The site runs cookieless Umami (no cookies, no PII, no consent banner — a deliberate
posture), and the Privacy Policy explicitly promises "no advertising or marketing
trackers" and "no selling or sharing of data with third parties." Apollo's website
tracker loads a third-party script that reverse-resolves visitor IPs to company
identities and feeds Apollo's B2B dataset. It is precisely the category the site says
it avoids. So the design question is less "how to inject a script" and more "how (or
whether) to do this without making the site's own promises false."

## Goals / Non-Goals

**Goals:** identify visiting companies for B2B/VC signal; do it lawfully and honestly
(disclosed + consented); keep it disable-able; don't silently contradict the site's
privacy claims.

**Non-Goals:** removing Umami; a full consent-management platform; per-user profiles
beyond company-level identification.

## Decisions

### Decision 1 — Config-gated injection

Inject the tracker before `</head>` in `Base.astro`, rendered only when
`PUBLIC_APOLLO_APP_ID` is set (mirrors the Umami pattern), so dev/forks/PR previews
don't load it and it can be turned off.

### Decision 2 — This is the real work: reconcile the privacy posture

Apollo can't just be added on top of the current stance. Three honest paths:

| Path | What | Trade-off |
|---|---|---|
| **A. Disclose + consent-gate** (recommended) | Update Privacy/Terms to disclose third-party company identification; load Apollo **only after consent** (a minimal banner, or geo-gate so EU isn't tracked pre-consent) | Compliant + honest; adds a consent UX we deliberately avoided; partially dilutes the "no trackers" brand |
| **B. Disclose only, no consent** | Update policy, load Apollo for everyone | Simpler, but non-compliant for EU/ePrivacy; legal + trust risk |
| **C. Reconsider** | Don't add a client tracker; do **server-side IP→company enrichment** at the Cloudflare Worker/edge on page requests | First-party, no client script, no cookies, no consent banner — fits the ethos far better; less turnkey than Apollo's pixel, and still warrants disclosure |

Recommended: **A** if Apollo's pixel is the chosen tool; **strongly consider C** first,
since it gets most of the "which companies visit" value without importing a
de-anonymization tracker into a privacy-positioned site.

### Decision 3 — Consent mechanism (if Path A)

Apollo is non-essential third-party tracking → consent required (GDPR/ePrivacy) before
load. Minimum viable: a small consent prompt that, on accept, calls `initApollo()`;
default = not loaded. Optionally geo-gate (load without prompt only outside consent
jurisdictions) — imperfect but common. Umami (cookieless, essential-analytics) stays
consent-free.

### Decision 4 — Mandatory disclosure

Privacy Policy and Terms MUST be updated to state that a third-party service
(Apollo.io) is used to identify the *company* (not the individual) of some visitors,
and that this involves sharing the request IP with that third party. Without this the
pages are misleading.

## Risks / Trade-offs

- **Falsifies the current Privacy Policy** unless updated — the biggest issue; legal +
  trust exposure.
- **Consent/compliance** — EU visitors need prior consent; shipping without it is a
  real risk.
- **Brand** — the dev/privacy audience strongly dislikes visitor de-anonymization;
  discovery (e.g. someone spots the Apollo script) could dent the "trust is the
  product" position.
- **Third-party script** — remote JS, possible cookies/fingerprinting, perf, and a new
  data processor relationship.

## Open Questions

- Path A vs C (Apollo pixel + consent, or server-side edge enrichment).
- If A: full consent banner vs geo-gate; which jurisdictions.
- Whether the value (company-level visitor signal) justifies the trust trade for *this*
  brand, or whether it belongs only on a separate investor-facing surface.
