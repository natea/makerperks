import type { APIRoute } from "astro";
import {
  getPublishedPrograms,
  byValueDesc,
  displayValue,
  programPath,
  AUDIENCE_LABELS,
  type Audience,
} from "../lib/programs";

/**
 * /llms-full.txt — every program inlined into one self-contained document for
 * agents that prefer a single fetch.
 */
export const GET: APIRoute = async ({ site }) => {
  const base = (site?.toString() ?? "https://makerperks.com").replace(
    /\/$/,
    "",
  );
  const programs = (await getPublishedPrograms()).sort(byValueDesc);

  const lines: string[] = [
    "# MakerPerks — full program directory",
    "",
    "> Builder perks for startups, students, OSS maintainers, indie devs, and non-profits. Always confirm the current offer on the provider's official page before applying.",
    `> ${programs.length} programs. Generated ${new Date().toISOString().slice(0, 10)}.`,
    "",
  ];

  for (const p of programs) {
    const d = p.data;
    const audiences = d.audience
      .map((a) => AUDIENCE_LABELS[a as Audience])
      .join(", ");
    lines.push(
      `## ${d.title}`,
      "",
      `- Provider: ${d.provider_slug}`,
      `- Value: ${displayValue(d)}`,
      `- Audience: ${audiences}`,
      `- Region: ${d.region ?? "global"}`,
      `- Status: ${d.status ?? "Active"}`,
    );
    if (d.aggregator) {
      lines.push(
        `- Gateway: unlocks ${(d.unlocks ?? []).join(", ") || "partner perks"}`,
      );
    }
    lines.push(
      `- Redeem: ${d.url}`,
      `- Page: ${base}${programPath(p)}`,
      `- Verified: ${d.verified}`,
      "",
      d.description,
      "",
    );
    if (d.tiers?.length) {
      lines.push("Tiers:");
      for (const t of d.tiers) {
        lines.push(`- ${t.name}: up to ${t.max_value} — ${t.intro}`);
      }
      lines.push("");
    }
  }

  return new Response(lines.join("\n"), {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
};
