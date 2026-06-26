# Audit Program Audiences

> **Project:** MakerPerks. Fixes a data-correctness bug in `audience[]` tagging
> introduced during source-list reconciliation in `add-makerperks-directory`.

## Why

Persona pages are showing programs that do not serve that persona:

- `/for/student` lists **"MongoDB for Startups"** (a startup-only credit program).
- `/for/nonprofit` lists **"Notion for Startups"**, **"Miro Startup Program"**,
  **"Airtable for Startups"**, **"Atlassian for Startups"**, **"Zendesk for
  Startups Program"** — all startup programs.

The persona filter is correct; the **data is over-tagged**. Reconciliation assigned
a program's `audience[]` from *whichever source list it appeared in*, not from what
the program actually offers. A program that showed up in a nonprofit- or
student-themed `awesome-*` list inherited `nonprofit` / `student` even when it only
has a startup offering. Today 12 records carry `nonprofit` (≥5 are plainly startup
programs) and 14 carry `student` (at least MongoDB is a false positive).

False positives are the worst failure mode for this product: the whole promise is
"I am _X_ — what can I _actually_ claim?" Showing a startup-only perk on the student
page erodes exactly the trust the directory exists to provide.

## What Changes

- **Define the audience-accuracy rule.** A program's `audience[]` SHALL list only
  personas it genuinely serves — i.e. the program has an explicit offering or
  eligibility path for that group — never every source list it appeared in.
- **Audience is per-record, not per-provider.** A provider may legitimately run
  separate programs for different audiences (e.g. Google for Startups vs. Google for
  Nonprofits), which exist as distinct records each tagged for its own audience. The
  audit corrects each record against *that program's* offering; it does NOT collapse a
  provider to one audience, nor copy one record's audience onto the provider's others.
- **Audit all ~208 records.** Re-validate each program's `audience[]` against its
  own `title` / `description` / `tiers[].eligibility` / `url`, correcting both
  over-tagging (the false positives above) and any under-tagging surfaced.
- **Harden reconciliation.** Appearing in an audience-themed source SHALL no longer
  auto-add that audience without corroboration from the program's own offering, so
  future ingests don't reintroduce the bug.

## Impact

- **Affected specs:** `program-data` (audience accuracy), `data-ingest` (no audience
  inference from source membership alone).
- **Affected code:** the program YAML records (`audience[]` fields), and the
  reconciliation logic in `scripts/ingest-sources.mjs` / `scripts/data/`.
- **User-visible:** persona pages stop showing off-persona programs; per-persona
  counts drop to the truthful set.

## Non-goals

- No change to the persona filter logic or the browse UI — this is data + ingest.
- No change to `value`, `verified`, `sources[]`, or any non-audience field.
- Not adding new programs or new audiences.
