# MakerPerks

A browseable, agent-friendly directory of builder perks (free credits, discounts,
and programs) for startups, students, OSS maintainers, indie devs, and non-profits.

- **Domains:** `makerperks.com` (site) · `makerperks.dev` (agent endpoints / redirect)
- **Spec workflow:** OpenSpec (see below). Active changes live in
  `openspec/changes/`; run `openspec list` to see them.
- **Stack:** Astro · content collections (one YAML file per program) · JSON-Schema
  validated · static, PR-editable, no backend.

## Design Context

Strategic product context lives in **`PRODUCT.md`** (register, users, personality,
anti-references, design principles, a11y). The visual system lives in **`DESIGN.md`**
("The Trusted Ledger" — tokens are resolved in `src/styles/global.css`). Read
PRODUCT.md before any UI work.

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

## Spec workflow — OpenSpec

This project is spec-driven via **OpenSpec**. Non-trivial work flows through a
_change_: a proposal + design + delta specs + a task list, implemented and then
archived into the durable spec baseline. Don't start substantial features with
ad-hoc edits — capture them as a change first.

**Layout**

- `openspec/changes/<name>/` — an active change: `proposal.md` (why / what / impact),
  `design.md` (decisions, trade-offs), `specs/<capability>/spec.md` (delta specs:
  `## ADDED|MODIFIED|REMOVED|RENAMED Requirements`), `tasks.md` (checklist; mark
  `- [ ]` → `- [x]` as you go).
- `openspec/specs/<capability>/spec.md` — the **main spec baseline** (current
  capabilities). Built by archiving changes; never hand-edit to land a feature.
- `openspec/changes/archive/YYYY-MM-DD-<name>/` — completed, archived changes.

**Lifecycle (slash commands → skills)**

- `/opsx:explore <idea>` — think/investigate only; never implement in explore mode.
- `/opsx:propose <idea>` — create a change with all artifacts.
- `/opsx:apply <name>` — implement the change's tasks, checking them off.
- `/opsx:archive <name>` — sync delta specs into the main baseline and archive.

**CLI (use the JSON for state, not guesses)**

```bash
openspec list                                   # active changes
openspec status   --change <name> --json        # artifact completion
openspec instructions apply --change <name> --json   # tasks + progress + state
openspec validate <name> --strict               # gate before archiving
openspec archive  <name> -y                      # syncs delta→main specs, then archives
```

**Conventions**

- Definition of done for a change = all tasks `[x]`, `openspec validate --strict`
  passes, and (for code) typecheck + `npm run build` + `npm run lint` green.
- `openspec archive` both **applies the delta specs to `openspec/specs/`** and moves
  the change to `archive/`. Archiving the foundational change first keeps the main
  baseline complete when later changes only add deltas.
- UI tasks inside a change still go through `impeccable` (above); data/build/schema
  tasks do not.
