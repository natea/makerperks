## Why

The footer is doing too little and sized too loud. It carries no way to give
feedback, no privacy or terms links (table stakes for a public site that's adding
analytics), and an unattributed copyright. The footer text is also larger than
footer chrome should be, competing with page content.

## What Changes

- **Tighten the footer type scale** so the footer reads as quiet chrome, not body
  content.
- **Add a Feedback link** to a Google Form so visitors can report dead offers or
  suggest programs — directly reinforcing the directory's "current & trustworthy"
  promise.
- **Add Privacy Policy and Terms of Use links**, and **create minimal on-site
  `/privacy` and `/terms` pages** as their targets (so the links work immediately and
  are editable in-repo).
- **Set the copyright** to `© <year> Jazkarta, Inc.`
- Footer presentation and the two legal pages are design surfaces and are built
  through the `impeccable` skill.

## Capabilities

### New Capabilities

- `site-footer`: the site-wide footer's content and legal/feedback links, plus the
  on-site privacy and terms pages they target.

### Modified Capabilities

(none — the footer has no prior spec; this introduces it.)

## Impact

- **Affected specs:** `site-footer` (new).
- **Affected code:** `src/layouts/Base.astro` (footer markup, links, copyright, and
  reduced type scale); new `src/pages/privacy.astro` and `src/pages/terms.astro`.
- **Config:** the Google Form feedback URL (filled at implementation; a placeholder
  constant until provided).
- **Non-goals:** no change to the header/nav, no cookie-consent UI, no legal review of
  the page copy (starter content the owner edits).
