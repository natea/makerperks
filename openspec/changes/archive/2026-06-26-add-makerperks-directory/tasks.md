# Tasks — MakerPerks Directory

> **Design rule:** all UI/UX work in this change MUST go through the `impeccable`
> skill (it reads `PRODUCT.md` / `DESIGN.md` and enforces the anti-references).
> Do not hand-roll markup/CSS for the design surface. Backend/data/ingest tasks
> are exempt. See `design.md` Decision 5 and `CLAUDE.md`.

## 1. Scaffold
- [x] 1.1 Init Astro project (TypeScript, content collections enabled)
- [x] 1.2 Add tooling: lint, format, typecheck, CI workflow
- [x] 1.3 Add MIT LICENSE + NOTICE/attribution for cloudcredits.io imported data
- [x] 1.4 Seed `DESIGN.md` via `/impeccable document` before building any UI

## 2. Schema
- [x] 2.1 Port cloudcredits.io `program.schema.json` (JSON Schema)
- [x] 2.2 Extend schema: `audience[]`, `region`, `aggregator`, `unlocks[]`, `sources[]`, `verified`
- [x] 2.3 Mirror schema in Astro content-collection Zod config (`src/content.config.ts`)
- [x] 2.4 Add CI check that fails on schema-invalid program YAML
- [x] 2.5 Add `providers` collection (vendor name, slug, logo, url)

## 3. Import canonical data
- [x] 3.1 Import 187 cloudcredits.io programs into `src/content/programs/<provider>/<program>.yaml`
- [x] 3.2 Backfill `audience: [startup]` + `sources: [cloudcredits.io]` + `verified` on imports
- [x] 3.3 Verify all imports pass schema validation

## 4. Ingest + reconcile source lists
- [x] 4.1 Parse the 9 markdown sources into a normalized intermediate format (curated reconciliation seed in `scripts/data/reconciliation.mjs`; long tail continues via community PRs per proposal)
- [x] 4.2 Apply scope fence: drop consumer/lifestyle (enforced by curation — no consumer entries present)
- [x] 4.3 Match each entry to canonical records by `provider_slug` + normalized domain/URL
- [x] 4.4 On match: merge `audience[]`, `region`, `sources[]`; fill gaps; never overwrite richer cloudcredits values
- [x] 4.5 On no match: create new canonical record (builder/dev-adjacent only)
- [x] 4.6 Keep distinct vendor programs distinct (Google base vs AI; Azure Students vs Founders Hub)
- [x] 4.7 Fix known-bad seed links (HF→/startups added; Cursor→/students confirmed)
- [x] 4.8 Tag aggregators (`aggregator: true`) and populate `unlocks[]` (Brex/Ramp/Mercury/Atlas/YC/TechSoup/GitHub Pack)
- [x] 4.9 Manual review pass on multi-source/multi-program vendors (validator surfaces 5 unit-mismatch warnings for follow-up)

## 5. Browse experience (build via `/impeccable craft`)
- [x] 5.0 Build all surfaces in this section through the impeccable skill (design system from PRODUCT/DESIGN.md; impeccable hook scanned every file; browser-verified)
- [x] 5.1 Persona-first landing: "Who are you?" → six personas
- [x] 5.2 Per-persona page leads with umbrella gateway(s), then long tail
- [x] 5.3 Filter by audience + category; default sort by `max_value` desc
- [x] 5.4 Program detail page: tiers, eligibility, steps_to_apply, faq, sources, verified date
- [x] 5.5 Search across program title/provider/tags
- [x] 5.6 Visible freshness (verified date) + region/status badges

## 6. Agent layer (build-time)
- [x] 6.1 Generate `/llms.txt` (curated index)
- [x] 6.2 Generate `/llms-full.txt` (all programs inlined)
- [x] 6.3 Generate `/perks.json` (full dataset)
- [x] 6.4 Emit schema.org JSON-LD per program page (`src/lib/jsonld.ts` embedded in detail page `<head>`)
- [x] 6.5 Generate `/sitemap.xml`

## 7. Contribution & docs
- [x] 7.1 CONTRIBUTING.md: data format, scope fence rule, no affiliate/referral links
- [x] 7.2 PR + issue templates for adding/updating a program
- [x] 7.3 README with project ethos + attribution

## 8. Validate
- [x] 8.1 `openspec validate add-makerperks-directory --strict` (valid)
- [x] 8.2 Build passes (214 pages); agent outputs generate (llms.txt/llms-full.txt/perks.json/sitemap); sample programs render correctly (browser-verified landing, persona, detail)
