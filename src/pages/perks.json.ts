import type { APIRoute } from "astro";
import {
  getPublishedPrograms,
  byValueDesc,
  displayValue,
} from "../lib/programs";

/**
 * /perks.json — the full machine-readable dataset (the agent/API surface).
 * Generated at build time from the canonical YAML so it can never drift.
 */
export const GET: APIRoute = async ({ site }) => {
  const programs = (await getPublishedPrograms()).sort(byValueDesc);
  const payload = {
    name: "MakerPerks",
    description:
      "A browseable, agent-friendly directory of builder perks for startups, students, OSS maintainers, indie devs, and non-profits.",
    homepage: site?.toString() ?? "https://makerperks.com",
    generated: new Date().toISOString().slice(0, 10),
    count: programs.length,
    programs: programs.map((p) => ({
      slug: p.id,
      title: p.data.title,
      provider: p.data.provider_slug,
      url: p.data.url,
      audience: p.data.audience,
      tags: p.data.tags,
      value_type: p.data.value_type,
      currency: p.data.currency,
      min_value: p.data.min_value,
      max_value: p.data.max_value,
      value_display: displayValue(p.data),
      region: p.data.region,
      status: p.data.status,
      aggregator: p.data.aggregator ?? false,
      unlocks: p.data.unlocks ?? [],
      sources: p.data.sources,
      verified: p.data.verified,
    })),
  };
  return new Response(JSON.stringify(payload, null, 2), {
    headers: { "content-type": "application/json; charset=utf-8" },
  });
};
