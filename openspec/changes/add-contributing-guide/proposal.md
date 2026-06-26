## Why

The site's **Contribute** link points at the bare GitHub org profile
(`github.com/makerperks`) — a dead end with no instructions. Yet the repo already has
a thorough `CONTRIBUTING.md` (data model, schema, scope fence, validation, a
copy-paste example) and issue-form templates for non-coders. Contributors just can't
find any of it from the site, so the open, PR-editable model the directory is built
on goes unused.

## What Changes

- **Repoint the Contribute link** to the `CONTRIBUTING.md` guide on the GitHub repo
  (the rendered file on `main`), so a visitor lands on clear instructions for adding
  or editing a provider/perk via PR — and, for non-coders, the linked issue forms.
- **Align the guide's `audience` guidance** with the now-baselined *audience
  accuracy* rule: list only personas the program genuinely serves (a real offering or
  eligibility path), never every list it appeared in — so contributions don't
  reintroduce the over-tagging the audit just fixed.

## Capabilities

### New Capabilities

- `contribution`: a discoverable, documented path for contributors to add or edit a
  provider/perk via pull request (or issue form), reachable from the site.

### Modified Capabilities

(none — the contribution path has no prior spec.)

## Impact

- **Affected code:** `src/layouts/Base.astro` (the Contribute `href`); a small edit to
  `CONTRIBUTING.md` (audience guidance). No layout/visual change — the link text and
  styling are unchanged, only its target.
- **Config:** the GitHub repo slug for the link URL (assume `makerperks/makerperks`;
  confirm at implementation).
- **Non-goals:** no redesign of the nav; no new in-app submission form; the existing
  `CONTRIBUTING.md` and issue templates are reused, not rebuilt.
