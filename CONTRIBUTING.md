# Contributing to MakerPerks

Thanks for helping keep the directory accurate and useful. The data is plain YAML —
one file per program — so contributing is a normal pull request.

## What belongs here (scope fence)

MakerPerks lists **builder + dev-adjacent** perks only:

> cloud · AI/ML · dev tools · SaaS · infra · security · data · learning · design ·
> productivity · hardware/CAD

We **do not** list consumer/lifestyle discounts (fashion, travel, food, banking,
streaming, therapy). A sharp boundary is part of the trust — AWS should never sit
next to a clothing coupon.

We also have **no affiliate links, referral codes, or ads.** `url` must point to the
official program page.

## Adding or updating a program

1. Create or edit a file at
   `src/content/programs/<provider_slug>/<program-slug>.yaml`.
2. Follow the schema in [`src/program.schema.json`](src/program.schema.json).
   Required fields: `provider_slug`, `title`, `intro`, `description`, `url`,
   `max_value`, `audience`, `sources`, `verified`.
3. `audience` is multi-valued — list **every** persona the program serves from:
   `startup · student · oss · indie · ambassador · nonprofit`.
4. `verified` is the date (YYYY-MM-DD) you confirmed the offer on the official page.
   Be honest — don't post-date it.
5. Quote dates: `verified: "2026-06-25"`.
6. If the program is an umbrella that unlocks others (a bank, accelerator, or
   verifier), set `aggregator: true` and list downstream `unlocks` by provider slug.
7. Add a provider file at `src/content/providers/<provider_slug>.yaml` if new.

### Minimal example

```yaml
provider_slug: example
title: Example for Startups
intro: Up to $10,000 in credits for early-stage startups.
description: A longer description of the program, eligibility, and value.
url: https://example.com/startups
value_type: credits # credits | discount | free_tier
currency: USD
max_value: 10000
audience: [startup]
region: global
sources: [makerperks]
verified: "2026-06-25"
```

## Before you open a PR

```bash
bun install
bun run validate:data   # schema + scope rules — must pass
bun run check           # Astro content + type check
bun run build           # regenerates the agent layer (llms.txt, perks.json)
```

CI runs the same checks; invalid data will block the merge.

## Reporting stale or wrong data

Open an issue using the **Update a program** template. Verified dates make staleness
visible, but the directory is only as current as its contributors — flagging a dead
link or changed amount is a real contribution.
