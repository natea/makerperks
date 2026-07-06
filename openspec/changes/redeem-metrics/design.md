# Design — Redeem-click metrics (unique redeem-clickers per perk)

## Context

The `engagement-capture` substrate (deployed Worker + D1) was built generic over event
type: `POST /event {session, target, type}` dedups by `(session, target, type)`, and
`GET /counts?type=X&min=N` returns the count of unique **owners** per target. `EVENT_TYPES`
already lists `redeem` (unused), and the client helper (`src/lib/engagement.ts`) already has
a generic `recordEvent(target, type)` and the `mp_sid` session. Redeem clicks are *also*
already tracked in cookieless Umami (`data-umami-event="redeem"`, with program/provider/
persona), giving **total** click volume.

So the substrate + counting for redeem already works; the only missing piece is **firing
the event on the redeem click**. This change adds that, to produce a per-perk **unique
redeem-clickers** metric for the studio's internal marketing measurement. It is
internal-only — no on-perk display.

## Goals / Non-Goals

**Goals:** a per-perk count of **unique visitors** who clicked a redeem/apply button,
deduped via the same `mp_sid` session as favorites; robust recording that survives the
outbound navigation; coexistence with the existing Umami event; a clear internal metric.

**Non-Goals:** displaying the count on the perk (a follow-up, needs `impeccable`); confirming
actual off-site redemption (not observable); distinguishing main vs per-tier clicks;
changing the substrate's requirements (it's already generic).

## Decisions

### Decision 1 — Reuse the substrate; the event type is `redeem-click`

Record redeem clicks through the existing substrate as event type **`redeem-click`** (add it
to `EVENT_TYPES`; rename the placeholder `redeem` there). No Worker code changes — dedup,
owner-resolution, and the count endpoints are all generic. **Why `redeem-click` (not
`redeem`):** it names the *action honestly* — a button click, not a confirmed claim. The
substrate then yields the **metric** below.

### Decision 2 — The metric is unique `redeem-clickers` (mp_sid dedup), NOT raw clicks

Because the substrate dedups by `(session, target, type)`, the count is **distinct owners
who clicked a redeem button on that perk** = **`redeem-clickers`**. This is the studio's
chosen metric (unique visitors, same browser storage as favorites). **Naming discipline:**
`redeem-click` = the event; `redeem-clickers` = the unique count. Wherever the metric is
shared, label it "unique redeem-clickers", not "clicks" — raw click volume is the Umami
number, and the two should be paired, not conflated. Kebab-case throughout (config, the
`type=` URL param, the spec, reporting labels); `redeemClickers` only if it becomes a JS/JSON
key in a report script.

### Decision 3 — Capture ALL redeem-type clicks, unified into one per-perk counter

Both the main `btn--primary` "Redeem on X" link and each per-tier `tier-apply` link record a
`redeem-click` for the **same perk id**. Since dedup is `(session, perk, redeem-click)`, a
visitor who clicks the main button *and* a tier button on one perk counts **once** — i.e.
"unique visitors who tried to claim this perk", regardless of which button. **Why unified:**
the marketing metric is per-perk conversion, not per-tier; tier-level granularity (separate
types) is a follow-up if ever needed.

### Decision 4 — Record via `sendBeacon` (survives the outbound nav)

The redeem link is `target="_blank"`, so the page usually persists, but middle-click /
cmd-click / same-tab cases can drop a plain `fetch`. Use **`navigator.sendBeacon`** (small
JSON body) to hand the event to the browser before navigation, with a `fetch(..., {keepalive:
true})` fallback where beacon is unavailable. The handler must **not** `preventDefault` — the
Umami event and the navigation proceed untouched; recording is fire-and-forget.

### Decision 5 — Internal metric only; consume via `GET /counts`

No on-perk UI. The metric is read from the substrate's existing
`GET /counts?type=redeem-click&min=1` → `{ perk: uniqueRedeemClickers }`. For the "internally
shared" deliverable, an optional small script can join `redeem-clickers` + save counts +
Umami totals into a digest (or feed the studio's goal-tracking sheet). Because redeem and
save share the owner, the **save→redeem funnel** (`GET /mine` per owner, or an aggregate
join) is available for free — the strongest reason this lives in the substrate rather than
Umami-only.

### Decision 6 — Privacy: redeem now attaches to the first-party session (disclosed)

Redeem was purely cookieless (Umami). Recording it to the substrate attaches it to the
`mp_sid` first-party session — and since redeem is higher-volume than save, ~every engaged
visitor now gets a session id (today only savers do). It stays anonymous, first-party,
mint-on-action, no PII, not shared — the same posture as favorites, just broader reach.
`/privacy` is extended to disclose that redeem clicks are recorded against the functional
session. This broadening is the one real trade-off of Decision 1 and is accepted deliberately.

## Risks / Trade-offs

- **Privacy footprint broadening** (redeem ≫ save volume) → anonymous/first-party/mint-on-
  action/disclosed; the alternative (a client-dedup anonymous counter with no server session)
  was considered and rejected for losing the funnel + being gameable. Accepted consciously.
- **`sendBeacon` reliability** (payload caps, older browsers) → tiny JSON; keepalive-fetch
  fallback; a dropped beacon just undercounts slightly (directional metric, acceptable).
- **Metric misread as raw clicks** → label "unique redeem-clickers"; pair with the Umami total.
- **Gaming / inflation** (cleared storage, multiple devices → multiple "unique") → same as
  favorites; the substrate's per-IP/session rate limits + bot heuristics apply; directional.
- **Dedup collapses main+tier** → intended (per-perk unique); tier granularity deferred.

## Migration Plan

- Additive: one `EVENT_TYPES` value + a client handler + a `/privacy` line. With the
  engagement endpoint unconfigured, nothing records and the redeem links behave exactly as
  today. No Worker code, no data migration.

## Open Questions

- Reporting mechanism: ad-hoc `GET /counts` query vs a scheduled digest (freshness-flow
  style) vs feeding the studio goal-tracking sheet — settle during implementation.
- Whether the digest should also compute save→redeem conversion in v1, or just the raw
  `redeem-clickers` counts (lean: counts first, funnel as a fast follow).
