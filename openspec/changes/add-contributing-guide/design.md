# Design — Contribute link → contribution guide

## Context

`Base.astro`'s Contribute CTA links to `https://github.com/makerperks` (the org
profile). The repo already contains a complete `CONTRIBUTING.md` (scope fence, file
layout `src/content/programs/<provider>/<slug>.yaml`, required fields, a minimal YAML
example, the `bun run validate:data` gate) and `.github/ISSUE_TEMPLATE/`
(`add-program.yml`, `update-program.yml`) for non-coders. The only gap is
discoverability from the site. Separately, `CONTRIBUTING.md` currently says to list
"every persona the program serves," which is right in spirit but should explicitly
echo the *audience accuracy* requirement now in the baseline so contributors don't
re-create source-inferred over-tagging.

## Goals / Non-Goals

**Goals:** the Contribute link lands on actionable instructions; the guide's audience
rule matches the spec baseline; reuse what exists.

**Non-Goals:** a new contribution doc (one exists); an in-app submission form; nav
redesign; changing the issue templates.

## Decisions

### Decision 1 — Link to CONTRIBUTING.md on `main`

Point the CTA at `https://github.com/<org>/<repo>/blob/main/CONTRIBUTING.md`. This is
GitHub-native: the file renders with formatting, is reachable from the repo's
"Contributing guidelines" affordance, and its issue-form links give non-coders a
path. A blob-on-`main` URL is stable and needs no extra hosting. Keep
`rel="noopener"` and the existing CTA styling/text — only the `href` changes, so this
is a content change, not a design-surface change (no `impeccable` needed).

_Alternatives:_ link to the repo root (README, less targeted) or a wiki/docs site
(more to maintain) — rejected; the canonical `CONTRIBUTING.md` is the right target.

### Decision 2 — Single source; align the audience note

Keep `CONTRIBUTING.md` as the one contribution doc. Edit only its `audience`
guidance to state the accuracy rule explicitly: list a persona only when the program
has a real offering/eligibility path for it — not because it appeared in a list
themed to that persona. This mirrors `specs/program-data` *Audience accuracy* and
closes the loop with the audit change so the bug can't re-enter through PRs.

## Risks / Trade-offs

- **Wrong repo slug ships a 404 link** → the slug is the one value to confirm at
  implementation; verify the URL resolves before merging.
- **Guide and schema drifting** → the guide references `src/program.schema.json`
  rather than restating every field, so the schema stays the single source of truth.

## Open Questions

- Exact `<org>/<repo>` slug (assume `makerperks/makerperks` from the current org
  link; confirm).
