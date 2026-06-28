/**
 * /extract step: fetch the submitted page (and at most one obvious sub-page), reduce
 * to text, and ask Claude to map it onto the program schema with per-field confidence
 * and an out-of-scope flag. Claude is used (over a heuristic) for structured-output
 * fidelity on messy marketing pages; we force a single tool call so the result is
 * already-typed JSON.
 */
import {
  AUDIENCES,
  VALUE_TYPES,
  CURRENCIES,
  type PerkRecord,
  slugify,
  today,
} from "./schema";

export interface ExtractResult {
  record: PerkRecord;
  confidence: Record<string, number>;
  out_of_scope: boolean;
  out_of_scope_reason?: string;
}

/** Strip a fetched HTML document to readable-ish text, capped for the prompt. */
function htmlToText(html: string, cap = 12000): string {
  const text = html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
  return text.slice(0, cap);
}

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { "user-agent": "MakerPerksBot/1.0 (+https://makerperks.com)" },
    cf: { cacheTtl: 120, cacheEverything: true },
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`fetch ${url} returned ${res.status}`);
  const ct = res.headers.get("content-type") ?? "";
  if (!ct.includes("text/html") && !ct.includes("text/plain"))
    throw new Error("URL did not return an HTML page");
  return htmlToText(await res.text());
}

const EXTRACT_TOOL = {
  name: "record_perk",
  description:
    "Record the builder-perk program described by the page, mapped to the MakerPerks schema.",
  input_schema: {
    type: "object",
    properties: {
      out_of_scope: {
        type: "boolean",
        description:
          "True if this is a consumer/lifestyle offer (fashion, travel, streaming, retail banking, food, gaming, etc.) rather than a builder/dev-adjacent perk (cloud, AI/ML, dev tools, SaaS, infra, security, data, design, productivity, learning, hardware).",
      },
      out_of_scope_reason: { type: "string" },
      provider_slug: {
        type: "string",
        description: "Lowercase hyphenated slug of the provider, e.g. 'aws'.",
      },
      title: { type: "string", description: "Official program name." },
      summary: {
        type: "string",
        description:
          "Neutral, noun-first one-liner of what the product is (no pitch, no dollar figures). <=120 chars.",
      },
      intro: {
        type: "string",
        description: "Concise summary of the offer + value.",
      },
      description: {
        type: "string",
        description: "Fuller description of the program.",
      },
      url: { type: "string", description: "The official program/apply URL." },
      value_type: { type: "string", enum: [...VALUE_TYPES] },
      max_value: {
        type: "number",
        description:
          "Max credit value (USD), or discount percentage, or 0 if a free tier / unspecified.",
      },
      min_value: { type: "number" },
      currency: { type: "string", enum: [...CURRENCIES] },
      audience: {
        type: "array",
        items: { type: "string", enum: [...AUDIENCES] },
        description:
          "Which builder personas this serves. Be accurate, not generous.",
      },
      tags: {
        type: "array",
        items: { type: "string" },
        description:
          "Up to 5 builder/dev-adjacent category tags, e.g. cloud, ai, dev tools.",
      },
      region: {
        type: "string",
        description: "'global' or a region code like US, EU.",
      },
      aggregator: {
        type: "boolean",
        description:
          "True if this is a gateway whose value is unlocking builder perks from OTHER providers (e.g. Mercury, Brex, Ramp, Y Combinator).",
      },
      unlocks: {
        type: "array",
        items: { type: "string" },
        description:
          "When aggregator=true, the lowercase provider slugs this gateway unlocks (e.g. aws, openai, perplexity).",
      },
      confidence: {
        type: "object",
        description: "Per-field confidence 0-1 for the values above.",
        additionalProperties: { type: "number" },
      },
    },
    required: [
      "out_of_scope",
      "provider_slug",
      "title",
      "intro",
      "description",
      "url",
      "value_type",
      "max_value",
      "audience",
      "tags",
    ],
  },
} as const;

const SYSTEM = `You extract builder-perk program metadata from a web page for MakerPerks, a curated directory of perks (free credits, discounts, programs) for startups, students, OSS maintainers, indie devs, ambassadors, and non-profits.

Scope fence: builder + dev-adjacent perks (cloud, AI/ML, dev tools, SaaS, infra, security, data, design, productivity, learning, hardware).

ALSO IN SCOPE — gateways/aggregators: business-banking, fintech, accelerator, or platform programs whose value is UNLOCKING builder credits/perks from OTHER providers (the way Mercury, Brex, Ramp, Stripe Atlas, and Y Combinator do). If the page is such a gateway, set out_of_scope=false, aggregator=true, and list the unlocked providers in 'unlocks' as lowercase slugs (e.g. aws, openai, perplexity). A platform is a gateway even if its core product is banking/finance, as long as it bundles builder perks.

OUT OF SCOPE — refuse (out_of_scope=true) only genuine consumer/lifestyle offers with no builder-perk unlock: fashion, travel, streaming, food/groceries, gaming, retail shopping, personal/consumer banking, fitness, dating, beauty. Do not invent program fields for these.

Rules:
- Audience accuracy: only include a persona if the page actually says it qualifies. Do not list every persona by default.
- Never fabricate a dollar value; use 0 if unstated. For a percentage discount use value_type "discount" and max_value = the percent.
- summary is a neutral noun-first one-liner, no marketing, no dollar amounts, <=120 chars.
- Set aggregator=true ONLY for genuine gateways, and then unlocks must be non-empty.
- Provide a confidence (0-1) for each field you fill.
Call the record_perk tool exactly once.`;

export async function extract(
  env: { ANTHROPIC_API_KEY: string; ANTHROPIC_MODEL: string },
  url: string,
): Promise<ExtractResult> {
  const pageText = await fetchText(url);

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: env.ANTHROPIC_MODEL,
      max_tokens: 1500,
      system: SYSTEM,
      tools: [EXTRACT_TOOL],
      tool_choice: { type: "tool", name: "record_perk" },
      messages: [
        {
          role: "user",
          content: `Source URL: ${url}\n\nPage text:\n${pageText}`,
        },
      ],
    }),
    signal: AbortSignal.timeout(45_000),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Claude API error ${res.status}: ${detail.slice(0, 300)}`);
  }

  const data = (await res.json()) as {
    content?: Array<{
      type: string;
      name?: string;
      input?: Record<string, unknown>;
    }>;
  };
  const toolUse = data.content?.find(
    (c) => c.type === "tool_use" && c.name === "record_perk",
  );
  if (!toolUse?.input)
    throw new Error("Claude did not return a structured record");
  const out = toolUse.input as Record<string, unknown>;

  const confidence = (out.confidence as Record<string, number>) ?? {};
  const out_of_scope = Boolean(out.out_of_scope);

  // Assemble the record with our defaults; the user reviews/edits everything next.
  const record: PerkRecord = {
    provider_slug: slugify(String(out.provider_slug ?? "")),
    title: String(out.title ?? "").trim(),
    intro: String(out.intro ?? "").trim(),
    description: String(out.description ?? "").trim(),
    summary: out.summary ? String(out.summary).slice(0, 120) : undefined,
    url: String(out.url ?? url).trim(),
    value_type: VALUE_TYPES.includes(out.value_type as never)
      ? (out.value_type as PerkRecord["value_type"])
      : "credits",
    currency: CURRENCIES.includes(out.currency as never)
      ? (out.currency as PerkRecord["currency"])
      : "USD",
    min_value: typeof out.min_value === "number" ? out.min_value : undefined,
    max_value: typeof out.max_value === "number" ? out.max_value : 0,
    audience: Array.isArray(out.audience)
      ? (out.audience.filter((a) =>
          AUDIENCES.includes(a as never),
        ) as PerkRecord["audience"])
      : [],
    tags: Array.isArray(out.tags) ? (out.tags as string[]).slice(0, 5) : [],
    region: out.region ? String(out.region) : "global",
    status: "Active",
    aggregator: Boolean(out.aggregator),
    unlocks: Array.isArray(out.unlocks)
      ? (out.unlocks as string[]).map((u) => slugify(String(u))).filter(Boolean)
      : [],
    sources: ["makerperks"],
    verified: today(),
  };

  return {
    record,
    confidence,
    out_of_scope,
    out_of_scope_reason: out.out_of_scope_reason
      ? String(out.out_of_scope_reason)
      : undefined,
  };
}
