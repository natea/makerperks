# Program Data

## ADDED Requirements

### Requirement: Automated freshness and link-health checks

The project SHALL run a recurring automated check over every published program that
verifies its outbound links still resolve and flags records whose verification date is
stale. The check SHALL surface its findings for human review and SHALL NOT silently
modify published records or fabricate a fresh verification date.

#### Scenario: Dead redeem link is flagged

- **WHEN** the scheduled check finds a program whose redeem URL (or a tier action URL)
  no longer resolves — a connection failure, a 4xx/5xx response, or a redirect to an
  unrelated/parked domain
- **THEN** that program is recorded in the freshness report as a broken link, with the
  failing URL and observed status

#### Scenario: Stale verification is flagged

- **WHEN** a program's `verified` date is older than the configured staleness threshold
- **THEN** that program is recorded in the report as due for re-verification

#### Scenario: Findings are reviewed, not auto-applied

- **WHEN** the check produces findings
- **THEN** they are delivered as a pull request (report plus any proposed review flags)
  for a maintainer to review and merge
- **AND** no program's `verified` date is automatically advanced and no record is
  published without that human review

#### Scenario: A healthy run is a no-op

- **WHEN** the check finds no broken links and nothing past the staleness threshold
- **THEN** it opens no change (or updates the report to show a clean run), rather than
  creating noise
