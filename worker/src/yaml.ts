/**
 * Serialize a reviewed record into the YAML shape the repo expects
 * (src/content/programs/<provider>/<slug>.yaml and providers/<provider>.yaml).
 * Uses the pure-JS `yaml` package (Worker-safe). Undefined fields are omitted.
 */
import { stringify } from "yaml";
import type { PerkRecord } from "./schema";

export function recordToYaml(rec: PerkRecord): string {
  // Field order roughly matching existing records for readable diffs.
  const obj: Record<string, unknown> = {
    provider_slug: rec.provider_slug,
    title: rec.title,
    summary: rec.summary,
    intro: rec.intro,
    description: rec.description,
    url: rec.url,
    value_type: rec.value_type,
    currency: rec.currency,
    min_value: rec.min_value,
    max_value: rec.max_value,
    audience: rec.audience,
    tags: rec.tags && rec.tags.length ? rec.tags : undefined,
    region: rec.region && rec.region !== "global" ? rec.region : undefined,
    status: rec.status && rec.status !== "Active" ? rec.status : undefined,
    sources: rec.sources,
    verified: rec.verified,
  };
  for (const k of Object.keys(obj)) if (obj[k] === undefined) delete obj[k];
  return stringify(obj, { lineWidth: 0 });
}

export function providerToYaml(p: { slug: string; name: string; url: string }): string {
  return stringify({ slug: p.slug, name: p.name, url: p.url }, { lineWidth: 0 });
}
