# Site Analytics

## ADDED Requirements

### Requirement: Company-level visitor identification

The third-party visitor-identification service (Apollo) SHALL be guarded when enabled,
because it departs from the cookieless, consent-free posture of the existing pageview
analytics. It SHALL load only by configuration, SHALL be disclosed in the Privacy
Policy and Terms, and SHALL NOT load for a visitor whose jurisdiction requires prior
consent until that consent is given. The cookieless pageview analytics SHALL remain
unaffected.

#### Scenario: Disabled by default / on forks

- **WHEN** the site is built without the visitor-identification service configured
- **THEN** no third-party identification script is loaded

#### Scenario: Disclosed before use

- **WHEN** the visitor-identification service is enabled
- **THEN** the Privacy Policy and Terms disclose that a third-party service identifies
  some visitors' company via their IP, so the published privacy statements remain
  accurate

#### Scenario: Consent-gated where required

- **WHEN** a visitor in a jurisdiction that requires prior consent for non-essential
  third-party tracking loads the site
- **THEN** the identification script does not load until the visitor consents

#### Scenario: Cookieless pageview analytics unaffected

- **WHEN** company-level identification is enabled
- **THEN** the existing cookieless pageview analytics continues to run without cookies
  or a consent gate of its own
