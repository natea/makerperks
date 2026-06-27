## Why

We have no visibility into the most important action on the site — clicking
**Redeem** — and providers can't tell that a signup came from MakerPerks. Two cheap,
privacy-respecting wins close that gap: tag outbound redeem links with **UTM
parameters** (so each provider's own analytics attributes the referral to us), and
record the redeem click as a **cookieless Umami event** (so we can see clicks per
program / persona). Deeper conversion tracking — *who* redeemed and *how much* they
got — needs identity-level instrumentation and is a deliberate later round.

## What Changes

- **UTM attribution on outbound redeem links.** Append
  `utm_source=makerperks&utm_medium=referral&utm_campaign=<persona|directory>&utm_content=<program>`
  to the provider URL on the Redeem CTA (merged safely with any existing query
  string). The link still points to the official page — this is attribution, **not**
  an affiliate link or redirect.
- **Cookieless redeem-click events.** Tag the Redeem CTA with Umami custom-event
  attributes carrying program / provider / persona, so click counts are measurable in
  the existing privacy-friendly analytics — no cookies, no PII, no consent change.
- **Consistent treatment** for other outbound provider links where it makes sense
  (e.g. tier "apply" actions).

## Capabilities

### New Capabilities

(none — extends site-analytics.)

### Modified Capabilities

- `site-analytics`: add **redeem-click attribution and tracking** — UTM-tagged
  outbound redeem links plus cookieless redeem-click events, alongside the existing
  privacy-respecting pageview analytics.

## Impact

- **Affected specs:** `site-analytics` (added requirement).
- **Affected code:** a small `withUtm()` URL helper (`src/lib/`), the Redeem CTA and
  outbound action links in `src/pages/programs/[...slug].astro` (UTM + Umami event
  attributes). Not a visual change (href + data attributes only), so no `impeccable`.
- **Non-goals / explicit follow-up (separate round):** identity-level conversion
  tracking (who redeemed, amount received); PostHog adoption and funnels (a heavier,
  cookie/identity tracker — revisit deliberately against the privacy ethos); any
  server-side click redirect for first-party counts.
