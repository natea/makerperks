# Site Analytics

## ADDED Requirements

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
