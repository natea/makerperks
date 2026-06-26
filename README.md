# MakerPerks

**A browseable, agent-friendly directory of builder perks** — free credits,
discounts, and programs for startups, students, OSS maintainers, indie developers,
and non-profits.

> There's hundreds of thousands of dollars in free credits and tools available to
> people building things, scattered across viral posts and unmaintained lists. Most
> builders never claim a cent. MakerPerks answers one question: **"I am _X_ — what
> can I claim, how much, and where do I redeem it?"**

- **Website:** [makerperks.com](https://makerperks.com)
- **Agents:** [`/llms.txt`](https://makerperks.com/llms.txt) ·
  [`/llms-full.txt`](https://makerperks.com/llms-full.txt) ·
  [`/perks.json`](https://makerperks.com/perks.json)

## What makes it different

- **Persona-first.** Browse by _who you are_ — startup, student, OSS maintainer,
  indie dev, ambassador, or non-profit — not just by category.
- **Trustworthy.** Verified dates, honest eligibility and caveats, and **no ads or
  affiliate links**. Credibility is the product.
- **Agent-native.** The full dataset is published as `llms.txt`, `llms-full.txt`,
  `perks.json`, and per-page schema.org JSON-LD — generated from the same source of
  truth, so they never drift.
- **Curated, not exhaustive.** Builder + dev-adjacent scope only. No consumer deals.

## How it works

Each program is one schema-validated YAML file under `src/content/programs/`.
The site (Astro) and the agent layer are both generated from those files. Editing
the directory is a normal pull request — see [CONTRIBUTING.md](CONTRIBUTING.md).

```
src/
  content/
    programs/<provider>/<program>.yaml   # canonical records (one per program)
    providers/<provider>.yaml            # vendor metadata
  program.schema.json                    # canonical JSON Schema (CI-validated)
  content.config.ts                      # Astro/Zod mirror of the schema
  lib/                                   # data helpers + JSON-LD
  pages/                                 # site + agent endpoints
scripts/
  validate-data.mjs                      # schema + scope-rule checks (CI gate)
  import-cloudcredits.mjs                # one-time import of the cloudcredits.io base
  ingest-sources.mjs                     # reconcile community source lists
```

## Develop

```bash
bun install
bun run dev            # local dev server
bun run validate:data  # schema + scope rules
bun run check          # Astro content + type check
bun run build          # static build + agent layer
```

## Data provenance & attribution

The program schema and a seed of records are adapted from
[cloudcredits.io](https://cloudcredits.io) (MIT), then extended with the persona
axis and reconciled with several community lists. See [NOTICE.md](NOTICE.md) for full
attribution. Every record carries its origins in a `sources[]` field.

Always confirm the current offer on the provider's official page before applying.

## License

[MIT](LICENSE). Data contributions are made under the same terms.
