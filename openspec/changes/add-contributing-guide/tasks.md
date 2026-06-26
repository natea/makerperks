# Tasks — Contribute link → contribution guide

> Content + link change, not a design surface (the CTA's text/styling are unchanged —
> only its target). `impeccable` is not required.

## 1. Repoint the Contribute link

- [ ] 1.1 In `src/layouts/Base.astro`, change the Contribute CTA `href` from the org
  profile to `https://github.com/<org>/<repo>/blob/main/CONTRIBUTING.md` (confirm the
  `<org>/<repo>` slug; assume `makerperks/makerperks`), keeping `rel="noopener"`,
  `target` behavior, text, and styling

## 2. Align the guide's audience guidance

- [ ] 2.1 In `CONTRIBUTING.md`, update the `audience` step to state the accuracy rule
  explicitly: tag only personas the program genuinely serves (real offering /
  eligibility), never a persona inferred from source-list membership — referencing
  the *Audience accuracy* requirement

## 3. Verify

- [ ] 3.1 Build; the Contribute link in the rendered header points to the
  `CONTRIBUTING.md` URL and the guide covers add/edit + the issue-form path
- [ ] 3.2 Confirm the target URL resolves (no 404) for the actual repo slug
- [ ] 3.3 `openspec validate add-contributing-guide --strict` passes; typecheck, lint,
  build green
