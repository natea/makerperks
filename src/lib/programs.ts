import { getCollection, type CollectionEntry } from "astro:content";
import { AUDIENCES } from "../content.config";

export type Program = CollectionEntry<"programs">;
export type Audience = (typeof AUDIENCES)[number];

export const AUDIENCE_LABELS: Record<Audience, string> = {
  startup: "Startups",
  student: "Students",
  oss: "Open-source maintainers",
  indie: "Indie developers",
  ambassador: "Ambassadors",
  nonprofit: "Non-profits",
};

/** All published (non-draft) programs. */
export async function getPublishedPrograms(): Promise<Program[]> {
  const all = await getCollection("programs");
  return all.filter((p) => !p.data.draft);
}

/** Sort by max dollar value, descending — the default directory order. */
export function byValueDesc(a: Program, b: Program): number {
  return (b.data.max_value ?? 0) - (a.data.max_value ?? 0);
}

/** Programs for a given persona, value-sorted. */
export function forAudience(
  programs: Program[],
  audience: Audience,
): Program[] {
  return programs
    .filter((p) => p.data.audience.includes(audience))
    .sort(byValueDesc);
}

/** Human-readable value, honest about type. */
export function displayValue(p: Program["data"]): string {
  const { value_type, max_value, currency } = p;
  if (value_type === "discount" && max_value > 0) return `${max_value}% off`;
  if (value_type === "free_tier" || !max_value) {
    return max_value
      ? `Free / ~${money(max_value, currency)} value`
      : "Free / varies";
  }
  return `Up to ${money(max_value, currency)}`;
}

function money(n: number, currency = "USD"): string {
  const symbol = currency === "EUR" ? "€" : currency === "GBP" ? "£" : "$";
  return `${symbol}${n.toLocaleString("en-US")}`;
}

/** Canonical site path for a program detail page (entry id is `<provider>/<file>`). */
export function programPath(p: Program): string {
  return `/programs/${p.id}`;
}
