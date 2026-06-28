# Contribution

## ADDED Requirements

### Requirement: Paste-a-URL perk submission

The site SHALL provide a non-technical contribution path where a user submits a
program by pasting its URL, and an extraction agent fetches the page and proposes the
listing's metadata mapped to the program schema. This path SHALL NOT require git, a
GitHub account, or editing YAML.

#### Scenario: Submit by URL

- **WHEN** a user pastes a program URL into the contribute flow and submits it
- **THEN** the agent fetches the page and returns proposed values for the program's
  fields (title, provider, summary, description, value, audience, tags, region,
  eligibility)

#### Scenario: Out-of-scope perks are refused

- **WHEN** the pasted URL is a consumer/lifestyle offer outside the builder +
  dev-adjacent scope fence
- **THEN** the flow declines it and explains the scope, rather than creating a listing

### Requirement: Review before submission

Extracted metadata SHALL be presented in an editable form so the contributor can
review and correct every field before anything is submitted. Nothing SHALL be
published or queued without this review step, and low-confidence fields SHALL be
indicated.

#### Scenario: Edit then submit

- **WHEN** the agent's extracted fields are shown
- **THEN** the user can edit any field and only their reviewed values are submitted

### Requirement: Pull-request review queue

A submission SHALL enter a review queue implemented as a GitHub pull request that adds
the program's YAML record(s); no submission SHALL be published without human review
and the existing CI validation passing. Submissions SHALL be attributed to the project
bot rather than an individual.

#### Scenario: Submission opens a PR

- **WHEN** a user submits their reviewed perk
- **THEN** a pull request is opened adding the program (and provider, if new) YAML,
  with the source URL recorded, and CI validation runs on it

#### Scenario: Nothing publishes without review

- **WHEN** a submission is made
- **THEN** it appears as an open PR for a maintainer to review and merge, never
  auto-merged

### Requirement: Pre-submission dedup and validation

Before a pull request is opened, the system SHALL check the submission for duplicates
against existing records and validate it against the program JSON schema and the scope
fence. A likely duplicate SHALL be surfaced to the user, and a malformed or
out-of-scope record SHALL NOT become a PR.

#### Scenario: Duplicate is caught before submit

- **WHEN** the submitted program matches an existing provider/program (same official
  URL domain, provider, or title)
- **THEN** the user is shown the existing listing and the submission does not create a
  duplicate PR

#### Scenario: Invalid record is rejected pre-PR

- **WHEN** the reviewed data fails schema or scope-fence validation
- **THEN** no PR is opened and the user is told what to fix

### Requirement: Abuse protection on the submission endpoint

The public submission endpoint SHALL be protected against automated abuse with a
human-verification challenge and rate limiting, and SHALL hold no publishing secrets
in the static site.

#### Scenario: Bot submissions are blocked

- **WHEN** the submission endpoint is called without a valid human-verification token
  or beyond the rate limit
- **THEN** the request is rejected before any extraction or PR is performed

### Requirement: Contribution is promoted

The site SHALL actively promote contributing: a site-wide banner and a "suggest a
perk" prompt at the end of program listings, both leading into the paste-a-URL flow,
styled to the site's design system (not an off-brand callout).

#### Scenario: Promotion entry points

- **WHEN** a visitor browses the site or reaches the end of a listing
- **THEN** they see a clear, on-brand prompt to contribute a perk that links to the
  submission flow
