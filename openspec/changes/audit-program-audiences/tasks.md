# Tasks — Audit Program Audiences

> Data + ingest correctness change. No browse-UI/design work, so the `impeccable`
> skill is not required here (verification just confirms persona pages render the
> corrected set).

## 1. Surface the suspects
- [ ] 1.1 Add a `scripts/audit-audiences.mjs` report: for each non-startup audience, list every tagged program with its title/url so mismatches are reviewable
- [ ] 1.2 Flag high-confidence false positives (e.g. title contains "for Startups"/"Startup Program" but tagged `student`/`nonprofit`/`oss`)

## 2. Review and correct
- [ ] 2.1 Review every `nonprofit`-tagged record (12); keep only genuine nonprofit offerings
- [ ] 2.2 Review every `student`-tagged record (14); keep only genuine student offerings
- [ ] 2.3 Review `oss`, `indie`, `ambassador` tags for the same source-inferred error
- [ ] 2.4 Spot-check `startup` tags for under-tagging surfaced during review
- [ ] 2.5 Correct `audience[]` in each affected YAML (every record keeps ≥1 audience). Judge each record by its OWN offering — never copy a sibling record's audience just because it shares a provider

## 3. Harden reconciliation
- [ ] 3.1 Update `scripts/ingest-sources.mjs` / `scripts/data/` so source-list membership alone never adds an audience
- [ ] 3.2 Document the corroboration rule inline where audiences are assigned

## 4. Verify
- [ ] 4.1 `node scripts/validate-data.mjs` passes (all records still have ≥1 audience)
- [ ] 4.2 `node scripts/audit-audiences.mjs` reports no remaining title/audience contradictions
- [ ] 4.3 Browser-check `/for/student` and `/for/nonprofit`: no startup-only programs remain; counts reflect the truthful set
- [ ] 4.4 `openspec validate audit-program-audiences --strict` passes
