# Design — Redeem-click attribution & tracking

## Context

The Redeem CTA on the program detail page links straight to the provider's official
URL (`d.url`, `rel="noopener" target="_blank"`). Umami (cookieless) is already loaded
site-wide. PRODUCT.md's promise is "no ads, no affiliate links" and privacy-respecting
analytics — so any tracking here must stay attribution-only and cookieless. We want
the minimum that (a) lets providers attribute signups to us and (b) lets us count
redeem clicks, without identity-level tracking (that's a later round).

## Goals / Non-Goals

**Goals:** providers can attribute MakerPerks referrals; we can measure redeem clicks
per program/persona; zero cookies/PII/consent change; the link still goes to the
official page.

**Non-Goals:** who redeemed / amount received (needs identity + provider data —
follow-up); PostHog/funnels; a first-party click-redirect service; monetization.

## Decisions

### Decision 1 — UTM scheme, safely merged

Append, via a `withUtm(url, { campaign, content })` helper:
`utm_source=makerperks`, `utm_medium=referral`,
`utm_campaign=<persona id when on a persona-context page, else "directory">`,
`utm_content=<program slug>`. The helper parses the existing URL and **only adds keys
not already present**, preserving any query the provider URL already carries (no
double `?`, no clobbering). Persona-aware campaign + program-level content give
providers useful granularity.

### Decision 2 — Cookieless Umami custom events

Tag the CTA with Umami's data attributes — `data-umami-event="redeem"` plus
`data-umami-event-provider`, `data-umami-event-program`, `data-umami-event-persona`.
Umami records the named event with those properties, cookielessly, in the analytics we
already run. No new script, no cookie, no consent banner — it fits the existing
`site-analytics` privacy posture exactly.

### Decision 3 — Attribution ≠ affiliate

UTM tags identify the *source* of the visit; they carry no commission, no redirect,
and the link resolves to the provider's official page unchanged. This stays within
"no affiliate links." Worth stating in code comments so it isn't mistaken for
monetization later.

### Decision 4 — Scope of links

Primary: the Redeem CTA. Apply the same `withUtm()` + event treatment to other genuine
outbound provider actions (tier "apply" `action_url`s) for consistency. Internal links
and non-provider URLs are untouched.

### Decision 5 — PostHog / deep conversion = follow-up

PostHog (and "who redeemed how much") would add a cookie/identity tracker and
provider-side data — a real shift from the current cookieless ethos. Out of scope;
revisit as its own round with an explicit privacy decision. Umami events + UTM cover
the "how many / from where" question now.

## Risks / Trade-offs

- **Providers strip/ignore UTM** → can't control; still works where honored, costs us
  nothing.
- **URL already has query/UTM** → the helper merges without duplicating keys.
- **Privacy creep** → events are cookieless and carry no user identity, only the
  program/provider/persona of the click; keep it that way.
- **Umami event prop limits** → keep to a few low-cardinality props (provider,
  program, persona).

## Open Questions

- Campaign granularity: persona vs program vs both (lean: campaign=persona,
  content=program).
- Whether to eventually add a first-party click-count (Worker redirect) for numbers
  independent of Umami — heavier, follow-up.
