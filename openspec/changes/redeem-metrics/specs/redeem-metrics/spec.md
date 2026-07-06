# Redeem Metrics

## ADDED Requirements

### Requirement: Record at most one redeem-click event per visitor per perk

The system SHALL record a `redeem-click` engagement event for a perk, keyed by the visitor's
session, whenever the visitor clicks a redeem-type control on that perk — the main redeem
button or any per-tier apply button. Recording SHALL be deduplicated per
`(session, perk, redeem-click)`, so the substrate stores **at most one** redeem-click per
visitor per perk: it captures **that** a visitor clicked, not **how many times**. Raw click
volume is therefore NOT recorded here (it is measured only by the cookieless analytics redeem
event). Recording SHALL NOT block, delay, or cancel the outbound navigation.

#### Scenario: Main redeem click is recorded

- **WHEN** a visitor clicks the main "Redeem" button on a perk
- **THEN** a `redeem-click` event for that perk is recorded against their session, and the
  redeem link opens as before

#### Scenario: Tier apply click is recorded to the same perk

- **WHEN** a visitor clicks a per-tier apply button on a perk
- **THEN** a `redeem-click` event for that same perk is recorded

#### Scenario: Multiple redeem clicks by one visitor count once

- **WHEN** the same visitor clicks the main button and a tier button on one perk
- **THEN** that perk's redeem-clicker count reflects a single contribution from that visitor

#### Scenario: Recording does not interrupt the click

- **WHEN** a visitor clicks a redeem control
- **THEN** the navigation and the existing cookieless analytics event both proceed
  unaffected, whether or not the recording request completes

### Requirement: Expose the per-perk unique redeem-clickers metric

The system SHALL expose, per perk, the **`redeem-clickers`** metric — the count of unique
visitors (owners) who recorded a `redeem-click` — for internal reporting, read from the
substrate's count endpoint (`GET /counts?type=redeem-click`). This value is a count of
**clickers, not clicks**: it reflects distinct identities and, by construction (writes are
deduplicated), can never be raw click volume. The metric SHALL NOT expose individual session
or account identifiers.

#### Scenario: The count endpoint returns clickers, not clicks

- **WHEN** the metric for a perk is read from `GET /counts?type=redeem-click` after a single
  visitor clicks that perk's redeem button several times
- **THEN** the returned value counts that visitor once (unique clickers), not the number of
  clicks

#### Scenario: Count reflects unique visitors across sessions

- **WHEN** the metric for a perk is read after redeem clicks from several distinct sessions
- **THEN** the value equals the number of distinct identities that clicked

#### Scenario: Metric exposes no identities

- **WHEN** the redeem-clickers metric is read
- **THEN** the response contains counts only — no session or account identifiers and no
  personal data

### Requirement: Coexist with existing analytics and disable cleanly

Recording redeem clicks to the substrate SHALL NOT replace or suppress the existing
cookieless analytics redeem event. The two are complementary and measure different things
that MUST NOT be conflated: the substrate reports **unique redeem-clickers** (deduplicated
people), while the analytics event reports **total redeem clicks** (every click). Neither is
a substitute for the other. When the engagement substrate is unconfigured, no `redeem-click`
event SHALL be recorded and no session identifier SHALL be created, and the redeem links
SHALL continue to work.

#### Scenario: Total-click analytics unaffected

- **WHEN** a redeem control is clicked with the substrate enabled
- **THEN** the cookieless analytics redeem event still fires as before, so total click volume
  remains measured there (not in the substrate)

#### Scenario: Disabled substrate records nothing

- **WHEN** a visitor clicks a redeem control on a build with the engagement endpoint
  unconfigured
- **THEN** no `redeem-click` event is recorded, no session identifier is created, and the
  redeem link still opens normally

### Requirement: Disclose redeem-click recording

The Privacy Policy SHALL disclose, when redeem-click recording is enabled, that redeem
clicks are recorded against the visitor's functional first-party session, so the published
privacy statements remain accurate.

#### Scenario: Privacy discloses redeem recording

- **WHEN** the substrate is enabled and redeem clicks are recorded
- **THEN** the Privacy Policy states that clicking a redeem button is recorded against the
  functional first-party session, alongside the existing saved-perks disclosure
