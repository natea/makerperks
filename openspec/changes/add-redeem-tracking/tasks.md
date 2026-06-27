# Tasks — Redeem-click attribution & tracking

> Link + analytics change (href params + data attributes), not a visual design
> surface, so `impeccable` is not required.

## 1. UTM helper

- [x] 1.1 Add `withUtm(url, { campaign, content })` in `src/lib/` — parse the URL and
  add `utm_source=makerperks`, `utm_medium=referral`, `utm_campaign`, `utm_content`
  **only when not already present**; preserve any existing query string
- [x] 1.2 Unit-sanity: a URL with no query, with an existing query, and with an
  existing `utm_*` all come out correct (no double `?`, no clobbered keys)

## 2. Apply to outbound links

- [x] 2.1 Detail page Redeem CTA → `href={withUtm(d.url, { campaign: <persona|directory>,
  content: <program slug> })}`; keep `rel="noopener" target="_blank"`
- [x] 2.2 Apply the same `withUtm()` to other genuine outbound provider actions (tier
  `action_url`s); leave internal links untouched
- [x] 2.3 Comment that UTM is attribution, not an affiliate link (destination unchanged)

## 3. Cookieless click events

- [x] 3.1 Add Umami custom-event attributes to the Redeem CTA: `data-umami-event="redeem"`
  + `data-umami-event-provider` / `-program` / `-persona`
- [x] 3.2 Keep event props low-cardinality (provider, program, persona); no user identity

## 4. Verify

- [x] 4.1 Built Redeem links carry the UTM params and merge correctly with provider
  URLs that already have a query string
- [x] 4.2 Clicking Redeem fires the cookieless `redeem` event with the right props; no
  cookie set, no consent prompt; destination is the official page
- [x] 4.3 `openspec validate add-redeem-tracking --strict` passes; typecheck, lint,
  build green

## 5. Follow-ups (OUT OF SCOPE — not tracked here)

> Plain notes, not checkboxes.

- Identity-level conversion: who redeemed, amount received (needs provider data /
  accounts).
- PostHog adoption + funnels (cookie/identity tracker — explicit privacy decision).
- First-party click-count via a Worker redirect (numbers independent of Umami).
