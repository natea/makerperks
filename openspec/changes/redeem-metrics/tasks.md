# Tasks — Redeem-click metrics (unique redeem-clickers per perk)

> **Depends on `engagement-capture`** (deployed `makerperks-engagement` Worker + `mp_sid`
> session + generic event/count endpoints). **No Worker code change** — the substrate is
> already generic over event type; only a config value is added.
>
> **No design surface → `impeccable` not required.** The redeem buttons are unchanged
> visually; this only adds a click handler and an internal metric. (An on-perk "Redeemed by
> N+" badge is a deferred follow-up that *would* go through impeccable.)
>
> **Decisions (from design):** event type **`redeem-click`** · metric **`redeem-clickers`**
> = unique visitors (owners) who clicked, deduped by `mp_sid` (NOT raw clicks — that's the
> Umami number) · capture **both** the main Redeem button and per-tier apply buttons, unified
> into one per-perk counter · record via **`sendBeacon`** (survives the outbound nav), never
> `preventDefault` · **internal only** (read via `GET /counts?type=redeem-click`) · privacy:
> redeem now attaches to the first-party session, disclosed in `/privacy`.

## 1. Substrate config — no impeccable

- [x] 1.1 In `engagement-worker/wrangler.toml`, change `EVENT_TYPES` from `"favorite,redeem"`
  to `"favorite,redeem-click"` (rename the unused placeholder). No Worker code change; a
  config-only redeploy (`wrangler deploy`) picks it up. `CHALLENGE_EVENT_TYPES` stays empty
  (a redeem click needs no Turnstile).

## 2. Client recording — no impeccable

- [x] 2.1 Add a **beacon-based** record path to `src/lib/engagement.ts`:
  `recordClick(target, type)` using `navigator.sendBeacon` to `POST /event`
  `{ session, target, type }`, with a `fetch(..., { keepalive: true })` fallback; mints/reuses
  `mp_sid` (mint-on-action), and no-ops when the endpoint is unconfigured
- [x] 2.2 Mark the redeem controls in `programs/[...slug].astro` with the perk id (reuse the
  existing `data-umami-event-program={program.id}`, or add `data-redeem={program.id}`): the
  main `btn--primary` redeem link **and** each per-tier apply link
- [x] 2.3 Wire a click handler (in the existing site-wide controller or a small addition) that,
  on a redeem-control click, calls `recordClick(perk, "redeem-click")` — **without**
  `preventDefault`/`stopPropagation`, so the navigation and the existing
  `data-umami-event="redeem"` both proceed untouched
- [x] 2.4 No client-side dedup needed — the substrate dedups `(session, perk, redeem-click)`,
  so main + tier clicks on one perk collapse to a single unique contribution automatically

## 3. Privacy — no impeccable

- [x] 3.1 Extend the `/privacy` engagement disclosure: redeem clicks are now recorded against
  the functional first-party session (previously redeem was cookieless-only via Umami). Keep
  the existing cookieless-analytics + saved-perks statements accurate

## 4. Reporting / consumption — no impeccable

- [x] 4.1 Document the metric: `GET /counts?type=redeem-click&min=1` → `{ perk:
  uniqueRedeemClickers }`. Label it **"unique redeem-clickers"** wherever shared (pair with
  the Umami raw total, e.g. "240 unique · 380 total clicks")
- [x] 4.2 (Optional) a small script that joins `redeem-clickers` + save counts + Umami totals
  into a shareable digest for the studio's marketing metrics; note the **save→redeem funnel**
  is available for free (redeem + save share the owner)

## 5. Verify — no impeccable

- [x] 5.1 Build with the engagement endpoint **unconfigured** → no `redeem-click` recorded, no
  session id created, redeem links still open; `npm run build` succeeds
- [x] 5.2 With the endpoint **configured** (local `wrangler dev` + seeded D1): clicking the
  main Redeem button records a `redeem-click`; clicking main + a tier button on one perk
  counts **once** (unique); `GET /counts?type=redeem-click` returns that perk; the Umami
  `redeem` event still fires; navigation is not blocked (Playwright — capture the beacon/
  network + the new tab)
- [x] 5.3 Site typecheck + prettier + lint green; worker `wrangler deploy --dry-run` config check
