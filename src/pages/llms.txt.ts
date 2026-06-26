import type { APIRoute } from "astro";
import {
  getPublishedPrograms,
  forAudience,
  displayValue,
  programPath,
  AUDIENCE_LABELS,
  type Audience,
} from "../lib/programs";
import { AUDIENCES } from "../content.config";

/**
 * /llms.txt — a curated index for LLM/agent consumption, grouped by persona,
 * linking each program. Follows the llmstxt.org convention.
 */
export const GET: APIRoute = async ({ site }) => {
  const base = (site?.toString() ?? "https://makerperks.com").replace(
    /\/$/,
    "",
  );
  const programs = await getPublishedPrograms();

  const lines: string[] = [
    "# MakerPerks",
    "",
    "> A browseable, agent-friendly directory of builder perks (free credits, discounts, and programs) for startups, students, OSS maintainers, indie developers, and non-profits. Builder + dev-adjacent scope only. No ads, no affiliate links.",
    "",
    `Full machine-readable dataset: ${base}/perks.json`,
    `Full inlined version: ${base}/llms-full.txt`,
    "",
  ];

  for (const audience of AUDIENCES as readonly Audience[]) {
    const items = forAudience(programs, audience);
    if (!items.length) continue;
    lines.push(`## ${AUDIENCE_LABELS[audience]}`, "");
    for (const p of items) {
      const agg = p.data.aggregator ? " [gateway]" : "";
      lines.push(
        `- [${p.data.title}](${base}${programPath(p)})${agg}: ${displayValue(p.data)} — ${p.data.intro}`,
      );
    }
    lines.push("");
  }

  return new Response(lines.join("\n"), {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
};
