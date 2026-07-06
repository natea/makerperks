## Why

The Redeem click is MakerPerks' core value event — the moment a builder clicks through to
claim a perk. Umami already counts *total* redeem clicks (trend, by persona), but the
studio wants a per-perk **unique redeem-clickers** metric for internal marketing
measurement: which perks actually convert visitors into claim-attempts, and — paired with
saves — the save→redeem funnel. The engagement substrate already supports this generically;
this change simply wires the redeem buttons to it.

## What Changes

- Every redeem-type click — the main **"Redeem on X"** button and each per-tier **"apply"**
  button — records a deduplicated **`redeem-click`** event to the engagement substrate,
  keyed by the visitor's existing `mp_sid` session. So the per-perk count is **unique
  visitors, not raw clicks**.
- Recording uses **`navigator.sendBeacon`** so it survives the outbound navigation, and
  **coexists with** the existing cookieless `data-umami-event="redeem"` (both fire; neither
  blocks or delays the click).
- The per-perk **`redeem-clickers`** metric (the unique count) is read from the substrate's
  existing `GET /counts?type=redeem-click` for **internal reporting** — **no on-perk
  display** in this change.
- **Config only** on the backend: the substrate's `EVENT_TYPES` gains `redeem-click` (no
  Worker code change — the substrate is already generic over event type).
- **Privacy:** `/privacy` extends the engagement disclosure to cover redeem clicks, since
  redeem now attaches to the functional first-party session (like saving does).

## Capabilities

### New Capabilities

- `redeem-metrics`: record redeem-button clicks as deduplicated `redeem-click` engagement
  events per perk, and expose the per-perk unique **`redeem-clickers`** count for internal
  marketing reporting.

### Modified Capabilities

(none — the `engagement-capture` substrate is already generic over event type. This adds a
new consumer plus a config value, not a change to the substrate's requirements.)

## Impact

- **Depends on `engagement-capture`** (the deployed `makerperks-engagement` Worker + the
  `mp_sid` session + the generic event/count endpoints). No Worker code change; `EVENT_TYPES`
  gains `redeem-click`.
- **Site:** a small click handler wires the redeem + tier-apply links in
  `programs/[...slug].astro` to record a `redeem-click` for the perk; `src/lib/engagement.ts`
  gains a **beacon-based** record path (survives the outbound nav).
- **Privacy:** `/privacy` updated — redeem clicks now attach to the functional first-party
  session (a conscious broadening: redeem is higher-volume than save, so ~every engaged
  visitor gets a session id; still anonymous, first-party, mint-on-action, no PII).
- **Reporting:** the metric reads from `GET /counts?type=redeem-click&min=1`; optionally a
  small script joins `redeem-clickers` + save counts + Umami totals into a shareable digest
  (the "internally shared marketing metric").
- **Metric semantics (label carefully):** `redeem-clickers` = **unique visitors (owners)**
  who clicked a redeem button per perk — NOT raw click volume (that's the Umami number).
  Pair them where shared, e.g. "240 unique · 380 total clicks".
- **No design surface / no `impeccable`:** the redeem buttons are unchanged visually; this
  only adds a click handler. Internal metric only.
- **Non-goals / follow-ups:** an on-perk "Redeemed by N+" social-proof badge (deferred —
  needs `impeccable` + an honesty-guarded label); confirming actual off-site redemption
  (not observable — this is a click, not a confirmed claim); distinguishing main vs per-tier
  clicks (deliberately unified into one per-perk counter).
