# site-analytics Specification

## Purpose
TBD - created by archiving change add-umami-analytics. Update Purpose after archive.
## Requirements
### Requirement: Privacy-respecting site analytics

The site SHALL load a single cookieless analytics script (Umami) site-wide to record
pageviews, and SHALL NOT set cookies, collect personal data, or require a consent
banner for this. The script SHALL be deferred so it never blocks rendering.

#### Scenario: Analytics present on every page

- **WHEN** any page renders with analytics configured
- **THEN** the shared `<head>` includes the deferred Umami script tag with the
  configured website ID

#### Scenario: No cookies or consent gate

- **WHEN** a visitor loads a page with analytics enabled
- **THEN** no analytics cookie is set and no consent banner is shown

### Requirement: Configuration-gated and disable-able

The analytics website ID SHALL be configurable via environment, defaulting to the
project's production ID so the canonical build ships analytics without extra setup.
When the configured ID is empty, NO analytics script SHALL be emitted (the disable
path) and the build SHALL still succeed. The script source SHALL default to Umami
Cloud and be overridable for a self-hosted instance.

#### Scenario: Disabled by clearing the ID

- **WHEN** the site is built with the analytics website ID set to empty
- **THEN** no analytics script is emitted and the build succeeds normally

#### Scenario: Self-hosted override

- **WHEN** a self-hosted script source is configured
- **THEN** the analytics script loads from that source instead of Umami Cloud, with
  no code change

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

### Requirement: Redeem-click attribution and tracking

Outbound redeem links SHALL carry UTM attribution identifying MakerPerks as the
source, and redeem clicks SHALL be recorded as cookieless analytics events. Attribution
SHALL NOT change the link's destination (it resolves to the provider's official page,
not a redirect or affiliate link) and SHALL NOT introduce cookies, personal data, or a
consent requirement.

#### Scenario: Outbound redeem link is attributed

- **WHEN** a program's Redeem link is rendered
- **THEN** its URL carries `utm_source=makerperks` plus medium/campaign/content
  parameters
- **AND** any query string already present on the provider URL is preserved (no keys
  clobbered or duplicated)

#### Scenario: Redeem click is recorded cookielessly

- **WHEN** a visitor clicks a Redeem link
- **THEN** a named redeem event is recorded with the program / provider / persona as
  properties, without setting a cookie or collecting personal data

#### Scenario: Destination is unchanged

- **WHEN** a visitor follows a Redeem link
- **THEN** they arrive on the provider's official page (the UTM tags only mark the
  source; there is no affiliate redirect)

