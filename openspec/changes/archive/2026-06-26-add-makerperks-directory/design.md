# Design — Builder Perks Directory

## Context

Greenfield repo (only OpenSpec scaffolding exists). The product is a static,
PR-editable, agent-friendly directory of builder perks across six audiences. The
hard parts are not rendering — they are (1) the data model, (2) reconciling ~10
heterogeneous sources into canonical records, and (3) keeping it trustworthy.

## Goals / Non-Goals

**Goals:** persona-first browsing; PR-friendly data; richer-than-prior-art schema;
build-time agent outputs; honest freshness; clean MIT attribution.

**Non-Goals:** consumer discounts; live verification in this change; backend/auth.

## Decision 1 — Fresh repo, adopt cloudcredits.io schema, import its data

We own a new Astro repo rather than forking, for clean ownership and full design
control. We **adopt cloudcredits.io's program schema wholesale** (it is richer than
anything we'd design) and **import its 187 programs** as canonical records under
MIT attribution. Rationale: their `tiers[]` with `eligibility` /
`steps_to_apply` / `effort_level` and `faq[]` already encode the nuance founders
need; reinventing it would be strictly worse.

## Decision 2 — Program schema (adopted + extended)

Adopted fields (from cloudcredits.io): `draft`, `provider_slug`, `title`,
`meta_title`, `intro`, `description`, `status`, `tags`, `url`, `value_type`,
`currency`, `min_value`, `max_value`, `community_notes`, `tiers[]`, `faq[]`.

**Extensions (ours):**

| Field | Type | Why |
|---|---|---|
| `audience[]` | enum list: `startup \| student \| oss \| indie \| ambassador \| nonprofit` | The persona axis — the core differentiator. Multi-valued because programs serve multiple audiences (Azure = student+startup). |
| `region` | enum/string (`global` default, e.g. `IN`, `EU`, `US`) | Several sources flag region-locked programs (e.g. `[INDIA ONLY]`). |
| `aggregator` | bool | Marks umbrella gateways (TechSoup, GitHub Student Pack, Brex, YC, Stripe Atlas). |
| `unlocks[]` | provider_slug list | Cascade relationships ("open Mercury → unlocks AWS/OpenAI"). |
| `sources[]` | list of source ids | Provenance for every record. |
| `verified` | date | Set to the source's last-updated date when imported "as sourced". |

`audience[]` is a **filter dimension, not a folder** — one canonical file per
program, never duplicated per persona.

## Decision 3 — File layout (PR-friendly)

Mirror cloudcredits.io: `src/content/programs/<provider_slug>/<program>.yaml`,
one program per file, validated by `src/program.schema.json` (JSON Schema) +
Astro content-collection Zod schema. Small diffs, no merge conflicts on parallel
PRs, malformed PRs fail CI. A `providers` collection holds vendor metadata/logos.

## Decision 4 — Ingest & reconcile pipeline

```
  187 cloudcredits.io YAML ──► canonical records (seed)
                                      ▲
  6+ markdown lists ──► parse ──► normalize ──► MATCH by provider_slug/url/domain
                                      │
                          ┌───────────┴───────────┐
                     match found              no match
                          │                       │
                 merge: add audience[],     create new canonical
                 region, sources[],         record (scope-fenced:
                 fill gaps; DO NOT          drop consumer/lifestyle)
                 overwrite richer
                 cloudcredits data
```

**Reconcile rules:**
- cloudcredits.io is the **value/tier source of truth** when present; markdown
  lists contribute `audience[]`, `region`, extra programs, and corroboration.
- Distinct programs from the same vendor stay distinct (Google Cloud base $200K
  vs Google Cloud **AI** $350K; Azure Students vs MS Founders Hub).
- Fix known-bad seed links (LinkedIn HF→`/startups`, Cursor→`/students`).
- `verified` = source's last-updated date; never fabricate a fresh date.
- Scope fence applied at create-time: builder + dev-adjacent only.

## Decision 5 — All UI work goes through the Impeccable skill

Every change to the site's look, layout, or UX — pages, components, spacing,
typography, color, motion, responsive behavior, empty/error states, UX copy, and
accessibility passes — MUST be produced via the `impeccable` skill, not ad-hoc
CSS/markup. Impeccable reads `PRODUCT.md` (register `product`; personality
*trustworthy & precise*; the four anti-references; WCAG AA) and `DESIGN.md` and
enforces them — this is how we stay off the "AI slop" and "plain awesome-list"
floors we explicitly ruled out.

- New surfaces: `/impeccable craft <feature>` (shape → build).
- Visual system: `/impeccable document` seeds/refreshes `DESIGN.md`.
- Refinement: `/impeccable critique|audit|polish|layout|colorize|typeset|animate`.

Backend/data work (program YAML, schema, ingest/reconcile scripts, agent-output
generation) is exempt — Impeccable governs the frontend/design surface only.

## Decision 6 — Persona-first navigation + umbrella gateways

Primary nav = "Who are you?" (six personas) → secondary = category → default sort
= `max_value` desc (the framing that made the source post go viral). Each persona
page leads with its **umbrella gateway(s)** — the single highest-leverage first
step — then the long tail.

```
  Student   → GitHub Student Pack        (SheerID / .edu)
  Non-profit→ TechSoup, Google/MS NP     (501(c)(3))
  Startup   → Brex/Ramp/Mercury, YC, Atlas (biz acct / accelerator)
  OSS       → per-project               (public repo)
  Indie     → free tiers               (none)
  Ambassador→ vendor community programs (application)
```

## Decision 7 — Agent layer (build-time generated)

All generated from the same canonical YAML, so they can never drift:
- `/llms.txt` — curated index, links to each program page.
- `/llms-full.txt` — every program inlined into one document.
- `/perks.json` — full machine-readable dataset (the API surface).
- schema.org JSON-LD (`Offer` / `Organization`) in each page `<head>`.
- `/sitemap.xml` (which cloudcredits.io also lacks).

## Risks / Trade-offs

- **Staleness:** imported values age. Mitigation: visible `verified` date + freshness
  sort; community PRs; a future live-verification change.
- **Dedup precision:** vendor/program matching is fuzzy. Mitigation: match on
  `provider_slug` + normalized domain + URL; manual review of multi-program vendors.
- **Attribution:** MIT requires preserving cloudcredits.io copyright/attribution —
  include a NOTICE/attribution page and per-record `sources[]`.
- **Scope creep:** consumer deals will keep arriving via PRs. Mitigation: the scope
  fence is a documented, enforceable contribution rule.

## Migration / Rollout

Greenfield — no migration. Phase the build: scaffold → schema → import 187 →
ingest lists → nav → agent layer → attribution/CI.

**Naming & domains:** the product is **MakerPerks**. Serve the human site from
`makerperks.com` and point `makerperks.dev` at the agent layer (e.g.
`makerperks.dev/llms.txt`, `makerperks.dev/perks.json`) and/or redirect it to the
`.com`. Both domains were unregistered at proposal time. `.com` is the front door
because the audience spans non-developers (students, non-profits, founders); `.dev`
reinforces the developer/agent-native angle without sacrificing the trusted `.com`.
