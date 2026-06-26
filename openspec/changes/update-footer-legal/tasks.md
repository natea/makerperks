# Tasks — Update Footer & Legal

> **Design rule:** the footer presentation and the two legal pages are design surfaces
> and MUST be built through the `impeccable` skill (design.md). The only non-design
> input is the Google Form URL constant.

## 1. Footer — via `/impeccable`

- [x] 1.1 Reduce the footer type scale (meta/legal line `var(--fs-xs)`, tagline
  `var(--fs-sm)`); keep muted ink ≥ 4.5:1
- [x] 1.2 Add a labelled, wrapping utility-link row: Feedback, Privacy Policy, Terms
  of Use, alongside the existing `perks.json` / `llms.txt` links
- [x] 1.3 Feedback link → Google Form (placeholder constant until provided), new tab,
  `rel="noopener"`
- [x] 1.4 Set copyright to `© {year} Jazkarta, Inc.`

## 2. Legal pages — via `/impeccable`

- [x] 2.1 Create `src/pages/privacy.astro` (uses `Base`): analytics collected (Umami,
  cookieless, no PII), no ads/affiliate, no accounts — honest starter copy
- [x] 2.2 Create `src/pages/terms.astro` (uses `Base`): offers are third-party,
  confirm on the provider's page; standard disclaimer — honest starter copy
- [x] 2.3 Note in-repo that the copy is a starting point pending owner/counsel review

## 3. Verify

- [x] 3.1 Footer renders on every page with all links working; `/privacy` and
  `/terms` load in the site layout
- [x] 3.2 Footer text is smaller than body and still passes AA contrast; copyright
  reads `© {year} Jazkarta, Inc.`
- [x] 3.3 `openspec validate update-footer-legal --strict` passes; typecheck, lint,
  build green
