# MakerPerks

A browseable, agent-friendly directory of builder perks (free credits, discounts,
and programs) for startups, students, OSS maintainers, indie devs, and non-profits.

- **Domains:** `makerperks.com` (site) · `makerperks.dev` (agent endpoints / redirect)
- **Active plan:** `openspec/changes/add-makerperks-directory/` (run `openspec show
add-makerperks-directory`)
- **Stack:** Astro · content collections (one YAML file per program) · JSON-Schema
  validated · static, PR-editable, no backend.

## Design Context

Strategic product context lives in **`PRODUCT.md`** (register, users, personality,
anti-references, design principles, a11y). Visual system will live in **`DESIGN.md`**
once seeded. Read PRODUCT.md before any UI work.

Quick reference:

- **Register:** product (design serves fast browse/filter/scan + trust)
- **Personality:** trustworthy & precise — _dependable, clear, current_
- **Anti-references:** SaaS-cream AI slop · plain markdown awesome-list · cluttered
  coupon/deals site · stiff corporate enterprise
- **Accessibility:** WCAG 2.2 AA

## Design workflow — use Impeccable for ALL design work

**Any change that touches the site's look, layout, or UX MUST go through the
`impeccable` skill** (`impeccable:impeccable` plugin), not ad-hoc CSS/markup edits.
This applies to: pages, components, layout, spacing, typography, color, motion,
responsive behavior, empty/error states, UX copy, and accessibility passes.

- **New surface:** `/impeccable craft <feature>` (shape → build end-to-end).
- **Plan first:** `/impeccable shape <feature>`.
- **Improve existing:** `/impeccable critique|audit|polish|layout|colorize|typeset|
animate|clarify <target>`.
- **Seed/refresh the visual system:** `/impeccable document` → writes `DESIGN.md`.
- **Iterate in-browser:** `/impeccable live`.

Impeccable reads PRODUCT.md (and DESIGN.md) first and enforces the anti-references
above. Do not hand-roll UI that bypasses it — on-brand, slop-free output is the
whole point. Backend/data/ingest work (YAML records, schema, build scripts, agent
outputs) does not require impeccable; it is for the frontend/design surface.
