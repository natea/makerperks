/**
 * Worker-safe validation mirroring src/program.schema.json + the MakerPerks scope
 * fence. We can't run ajv here (it compiles validators with `new Function`, which the
 * Workers runtime forbids), so this is a focused hand validator covering the fields the
 * contribute flow produces. The canonical ajv check in CI (scripts/validate-data.mjs)
 * still runs on the opened PR — this is the pre-PR gate, not a replacement.
 */

export const AUDIENCES = [
  "startup",
  "student",
  "oss",
  "indie",
  "ambassador",
  "nonprofit",
] as const;
export type Audience = (typeof AUDIENCES)[number];

export const VALUE_TYPES = ["credits", "discount", "free_tier"] as const;
export const CURRENCIES = ["USD", "EUR", "GBP"] as const;
export const STATUSES = ["Active", "Discontinued", "Beta", "Upcoming"] as const;

/** The fields the flow extracts/submits. A subset of the full schema (no tiers/faq). */
export interface PerkRecord {
  provider_slug: string;
  title: string;
  intro: string;
  description: string;
  summary?: string;
  url: string;
  value_type: (typeof VALUE_TYPES)[number];
  currency: (typeof CURRENCIES)[number];
  min_value?: number;
  max_value: number;
  audience: Audience[];
  tags: string[];
  region: string;
  status: (typeof STATUSES)[number];
  sources: string[];
  verified: string; // YYYY-MM-DD
}

const SLUG_RE = /^[a-z0-9-]+$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// Obvious consumer/lifestyle signals outside the builder + dev-adjacent fence.
// Backstop only — Claude's out_of_scope flag is the primary gate.
const OUT_OF_SCOPE_TAGS = new Set([
  "fashion",
  "travel",
  "streaming",
  "banking",
  "food",
  "groceries",
  "retail",
  "gaming",
  "fitness",
  "dating",
  "beauty",
  "consumer",
  "lifestyle",
]);

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/** Validate a reviewed record. Returns the list of human-readable problems (empty = ok). */
export function validateRecord(rec: unknown): string[] {
  const errors: string[] = [];
  if (typeof rec !== "object" || rec === null) return ["record must be an object"];
  const r = rec as Record<string, unknown>;

  const reqStr = (k: string) => {
    if (typeof r[k] !== "string" || (r[k] as string).trim() === "")
      errors.push(`${k} is required`);
  };
  reqStr("provider_slug");
  reqStr("title");
  reqStr("intro");
  reqStr("description");
  reqStr("url");

  if (typeof r.provider_slug === "string" && !SLUG_RE.test(r.provider_slug))
    errors.push("provider_slug must be lowercase letters, numbers, and hyphens");

  if (typeof r.url === "string" && !/^https?:\/\//.test(r.url))
    errors.push("url must be an http(s) URL");

  if (typeof r.summary === "string" && r.summary.length > 120)
    errors.push("summary must be 120 characters or fewer");

  if (typeof r.max_value !== "number" || Number.isNaN(r.max_value))
    errors.push("max_value must be a number");

  if (r.value_type !== undefined && !VALUE_TYPES.includes(r.value_type as never))
    errors.push(`value_type must be one of ${VALUE_TYPES.join(", ")}`);
  if (r.currency !== undefined && !CURRENCIES.includes(r.currency as never))
    errors.push(`currency must be one of ${CURRENCIES.join(", ")}`);
  if (r.status !== undefined && !STATUSES.includes(r.status as never))
    errors.push(`status must be one of ${STATUSES.join(", ")}`);

  if (!Array.isArray(r.audience) || r.audience.length === 0) {
    errors.push("audience must have at least one persona");
  } else {
    for (const a of r.audience)
      if (!AUDIENCES.includes(a as never))
        errors.push(`audience "${a}" is not a known persona`);
  }

  if (r.tags !== undefined) {
    if (!Array.isArray(r.tags)) errors.push("tags must be an array");
    else if (r.tags.length > 5) errors.push("tags: at most 5 allowed");
  }

  if (!Array.isArray(r.sources) || r.sources.length === 0)
    errors.push("sources must be non-empty");

  if (typeof r.verified !== "string" || !DATE_RE.test(r.verified))
    errors.push("verified must be a date (YYYY-MM-DD)");

  return errors;
}

/** Scope-fence backstop: returns a reason if the record looks out of scope, else null. */
export function outOfScopeReason(rec: PerkRecord): string | null {
  const tags = (rec.tags ?? []).map((t) => t.toLowerCase());
  const hit = tags.find((t) => OUT_OF_SCOPE_TAGS.has(t));
  if (hit)
    return `Tag "${hit}" is a consumer/lifestyle category outside the builder + dev-adjacent scope.`;
  return null;
}

/** Today as YYYY-MM-DD (UTC). */
export function today(): string {
  return new Date().toISOString().slice(0, 10);
}
