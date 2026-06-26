# Add MakerPerks Directory

> **Project:** MakerPerks — a browseable, agent-friendly directory of builder perks.
> **Domain:** `makerperks.com` (front door) + `makerperks.dev` (agent endpoints /
> redirect). Both confirmed unregistered at proposal time; register at an at-cost
> registrar (e.g. Cloudflare).

## Why

Hundreds of companies offer free credits, perks, and discounts to people building
things — but the offers are scattered across dozens of viral LinkedIn posts and
unmaintained `awesome-*` GitHub lists. Founders, students, OSS maintainers, and
non-profits routinely leave $100K+ on the table because there is no single,
trustworthy, browseable place that answers one question: **"I am _X_ — what can I
claim, how much, and where do I redeem it?"**

The best prior art, [cloudcredits.io](https://cloudcredits.io)
([t3-sh/cloudcredits.io](https://github.com/t3-sh/cloudcredits.io), MIT), already
solves ~80% of this for **startups**: an Astro site with 187 programs, one
schema-validated YAML file per program, rich `tiers` / `eligibility` /
`steps_to_apply` data. But it has three gaps that are exactly our thesis:

1. **No persona axis.** Its tags are category-only and mostly empty; it is
   startup-only in practice. There is no student / OSS / non-profit / ambassador /
   indie dimension — no "who are you?" navigation.
2. **No non-startup audiences.** None of the student, OSS, or non-profit programs
   our research surfaced are present.
3. **No agent layer.** `llms.txt`, `llms-full.txt`, and `sitemap.xml` all 404.

We will build a fresh, independently-owned Astro directory that **adopts
cloudcredits.io's YAML schema and imports its 187 programs** (MIT permits this,
with attribution), then layers on the three differentiators above.

## What Changes

- Scaffold a new Astro site with content collections, one YAML file per program,
  JSON-Schema validation in CI, and GitHub-PR-based editing.
- Adopt the cloudcredits.io program schema; **extend** it with `audience[]` (the
  persona axis), `region`, and `aggregator` / `unlocks` (gateway relationships).
- Import the 187 cloudcredits.io programs as canonical records (with attribution).
- Ingest the locked on-thesis source set (below), deduping and reconciling against
  the canonical records, tagging each program with `audience[]` and provenance.
- Build **persona-first navigation**: filter by "who are you?" (startup / student /
  OSS / indie / ambassador / non-profit), then by category, default sort by max $.
- Surface the **umbrella-gateway model** (TechSoup, GitHub Student Pack,
  Brex/Ramp/Mercury, YC, Stripe Atlas) as the entry point per persona.
- Generate an **agent-friendly layer** at build time from the same data:
  `llms.txt`, `llms-full.txt`, `perks.json`, and per-page schema.org JSON-LD.

### Scope fence (decided)

**In:** builder + dev-adjacent perks — cloud, AI/ML, dev tools, SaaS, infra,
security, data/DB, **plus** learning, design, productivity, and hardware/CAD.

**Out:** pure consumer/lifestyle student discounts — fashion, travel, food,
banking, streaming, therapy. (Adidas/Amtrak/streaming never sit next to AWS.)

### Locked source set

| Source | Role |
|---|---|
| [t3-sh/cloudcredits.io](https://github.com/t3-sh/cloudcredits.io) (187) | Schema + canonical startup import |
| LinkedIn "$800K AI credits" post (10) | AI-credit seed |
| [doanbactam/awesome-builder-programs](https://github.com/doanbactam/awesome-builder-programs) | All personas |
| [Ildarflame/awesome-student-developer-deals](https://github.com/Ildarflame/awesome-student-developer-deals) | Student + multi-audience |
| [dakshshah96/awesome-startup-credits](https://github.com/dakshshah96/awesome-startup-credits) | SaaS-heavy startup (status/region signals) |
| [avinash201199/awesome-startup-credits](https://github.com/avinash201199/awesome-startup-credits) | Freshest startup + aggregator concept |
| [cloudcommunity/Free-for-Nonprofits](https://github.com/cloudcommunity/Free-for-Nonprofits) | Non-profit (replaces stale wordnik) |
| [tresni/awesome-nonprofit](https://github.com/tresni/awesome-nonprofit) | Non-profit |
| [DobroslavRadosavljevic/awesome-startup-deals](https://github.com/DobroslavRadosavljevic/awesome-startup-deals) | Startup, large net-new |
| [athman3/awesome-free-nonprofits](https://github.com/athman3/awesome-free-nonprofits) | Non-profit |

New sources after this change are handled as community PRs, not re-scoping.

## Impact

- **Affected specs (new capabilities):** `program-data`, `data-ingest`,
  `browse-experience`, `agent-outputs`.
- **Affected code:** new Astro project (greenfield repo; only OpenSpec scaffolding
  exists today).
- **Licensing:** must preserve cloudcredits.io MIT attribution for imported data.
- **Freshness risk:** several sources are stale; reconciliation uses `verified =
  source date` and surfaces freshness so old entries are visible, not hidden.

## Non-goals

- No affiliate links, referral codes, or ads (matches cloudcredits.io ethos).
- No consumer/lifestyle discounts (see scope fence).
- No automated live-scraping/verification of every program in this change
  (values are imported "as sourced" with provenance; live verification is a
  possible future change).
- No user accounts, submissions UI, or backend — editing is via GitHub PRs.
