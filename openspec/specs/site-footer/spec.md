# site-footer Specification

## Purpose
TBD - created by archiving change update-footer-legal. Update Purpose after archive.
## Requirements
### Requirement: Footer utility and legal links

The site-wide footer SHALL present, as quiet chrome at a reduced type scale, a
labelled set of utility links including Feedback (a Google Form, opened in a new tab),
Privacy Policy, and Terms of Use, alongside the existing data links. Footer text
SHALL remain legible (muted ink ≥ 4.5:1 on the footer background).

#### Scenario: Links present and reachable

- **WHEN** any page renders
- **THEN** the footer shows working Feedback, Privacy Policy, and Terms of Use links
- **AND** the Feedback link opens the Google Form in a new tab with `rel="noopener"`

#### Scenario: Quieter scale, still legible

- **WHEN** the footer renders
- **THEN** its text is smaller than page body text
- **AND** its muted text still meets WCAG 2.2 AA contrast (≥ 4.5:1)

### Requirement: On-site privacy and terms pages

The Privacy Policy and Terms of Use links SHALL resolve to on-site pages (`/privacy`
and `/terms`) rendered in the site layout, with content covering, respectively, what
analytics is and isn't collected and the no-ads/no-affiliate stance; and that listed
offers are third-party and must be confirmed on the provider's official page.

#### Scenario: Legal pages exist and render

- **WHEN** a visitor follows the Privacy Policy or Terms of Use link
- **THEN** an on-site page loads in the standard site layout with the relevant content

### Requirement: Attribution

The footer SHALL display the copyright as `© <current year> Jazkarta, Inc.`

#### Scenario: Copyright shown

- **WHEN** the footer renders
- **THEN** it shows `© <current year> Jazkarta, Inc.`

