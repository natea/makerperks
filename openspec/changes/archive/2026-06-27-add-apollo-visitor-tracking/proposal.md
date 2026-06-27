## Why

We'd like to know **which companies visit the site** — especially investors and
portfolio-relevant firms — as a partnership / sales / VC-interest signal (aligned with
the investor-facing direction we've been exploring). Apollo's website tracker
reverse-resolves a visitor's IP to a company identity to de-anonymize B2B traffic.

> ⚠️ **This conflicts with the site's stated privacy posture and must be reconciled,
> not bolted on.** Apollo is a **third-party B2B de-anonymization / marketing tracker**.
> The published Privacy Policy says *"No advertising or marketing trackers"* and *"No
> selling or sharing of data with third parties,"* and the `site-analytics` spec
> requires analytics be **cookieless with no consent gate**. Adding Apollo breaks all
> three unless this change also updates the policy and adds consent. Treat that as the
> core of the work.

## What Changes

- **Add the Apollo website tracker** (app id `6a3fc4051bb840001c7b810d`) before
  `</head>`, **config-gated** (e.g. `PUBLIC_APOLLO_APP_ID`) so it's disable-able and
  absent on forks/dev.
- **Reconcile the privacy posture (required):**
  - **Disclose** third-party visitor identification in the Privacy Policy and Terms —
    otherwise those pages become false.
  - **Gate on consent** where the law requires it (Apollo is non-essential
    third-party tracking → GDPR/ePrivacy consent for EU visitors). This means a
    consent mechanism (or geo-gating), reversing the deliberate "no consent banner"
    choice.
- **Keep Umami** (cookieless pageviews) unchanged; Apollo is additive.

## Capabilities

### New Capabilities

(none — modifies site-analytics.)

### Modified Capabilities

- `site-analytics`: add **company-level visitor identification** via a third-party
  tracker, with mandatory disclosure and consent guardrails — a deliberate relaxation
  of the current cookieless/no-consent privacy stance.

## Impact

- **Affected specs:** `site-analytics` (added requirement, in tension with the existing
  "Privacy-respecting" one).
- **Affected code:** `src/layouts/Base.astro` (the tracker script + consent gate),
  `src/pages/privacy.astro` + `src/pages/terms.astro` (disclosure), config
  (`PUBLIC_APOLLO_APP_ID`).
- **Trust / brand:** the privacy-conscious builder audience reacts strongly against
  de-anonymization trackers; this is a reputational trade, not just a feature flag.
- **Non-goals / alternatives to weigh (see design):** not removing Umami; not building
  a full consent-management platform; a **server-side IP→company enrichment** (via the
  Cloudflare Worker, no client tracker/cookies, first-party) is a cleaner-for-the-ethos
  alternative worth considering before shipping Apollo.
