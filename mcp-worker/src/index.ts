/**
 * MakerPerks MCP server — a first-party, read-only Model Context Protocol endpoint
 * over the builder-perks directory. Runs as a Cloudflare Worker (Durable Object via
 * the `agents` SDK's McpAgent). It reads the published `perks.json` (the same source
 * of truth as the static agent outputs), caches it briefly, and exposes intent-shaped
 * query tools so an agent can ask "what can an X claim?" without fetching and
 * filtering the whole dataset.
 *
 * Transports: Streamable HTTP at `/mcp` (modern) and SSE at `/sse` (legacy).
 * Public, read-only, soft per-IP rate limit. No auth, no mutating tools.
 */
import { McpAgent } from "agents/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

interface Env {
  MCP_OBJECT: DurableObjectNamespace;
  RATE_LIMITER: { limit(opts: { key: string }): Promise<{ success: boolean }> };
  PERKS_JSON_URL: string;
}

/** One program as published in /perks.json (see src/pages/perks.json.ts). */
interface Perk {
  slug: string;
  title: string;
  provider: string;
  url: string;
  audience: string[];
  tags: string[];
  value_type: string;
  currency: string;
  min_value: number;
  max_value: number;
  value_display: string;
  region: string;
  status: string;
  aggregator: boolean;
  unlocks: string[];
  sources: string[];
  verified: string;
}

interface PerksDataset {
  name: string;
  description: string;
  homepage: string;
  generated: string;
  count: number;
  programs: Perk[];
}

/** Persona ids the directory uses, with display labels. */
const PERSONA_LABELS: Record<string, string> = {
  startup: "Startups",
  student: "Students",
  oss: "Open-source maintainers",
  indie: "Indie developers",
  ambassador: "Ambassadors",
  nonprofit: "Non-profits",
};
const PERSONA_IDS = Object.keys(PERSONA_LABELS) as [string, ...string[]];

// Module-level cache: persists across requests handled by the same isolate, so we
// don't refetch perks.json on every call. Serves last-good on a failed refresh.
let perksCache: { data: PerksDataset; fetchedAt: number } | null = null;
const PERKS_TTL_MS = 5 * 60 * 1000;

async function loadPerks(env: Env): Promise<PerksDataset> {
  const now = Date.now();
  if (perksCache && now - perksCache.fetchedAt < PERKS_TTL_MS) {
    return perksCache.data;
  }
  try {
    const res = await fetch(env.PERKS_JSON_URL, {
      // Edge-cache the upstream fetch too; cheap and resilient.
      cf: { cacheTtl: 300, cacheEverything: true },
    });
    if (!res.ok) throw new Error(`perks.json fetch failed: ${res.status}`);
    const data = (await res.json()) as PerksDataset;
    perksCache = { data, fetchedAt: now };
    return data;
  } catch (err) {
    if (perksCache) return perksCache.data; // serve last-good rather than fail
    throw err;
  }
}

const byValueDesc = (a: Perk, b: Perk) =>
  (b.max_value ?? 0) - (a.max_value ?? 0);

/** MCP tool results carry structured JSON as text content. */
function jsonResult(obj: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(obj, null, 2) }],
  };
}

export class MakerPerksMCP extends McpAgent<Env> {
  server = new McpServer({ name: "makerperks", version: "1.0.0" });

  async init() {
    const data = await loadPerks(this.env);

    this.server.registerTool(
      "search_perks",
      {
        description:
          "Search builder-perk programs. All filters optional and combinable: free-text query (matches title, provider, slug, tag), audience/persona, category (tag), and a minimum dollar value. Results are sorted by value, highest first.",
        inputSchema: {
          query: z
            .string()
            .optional()
            .describe("Free-text match on title, provider, slug, or tag"),
          audience: z
            .enum(PERSONA_IDS)
            .optional()
            .describe(
              "Persona id: startup, student, oss, indie, ambassador, nonprofit",
            ),
          category: z
            .string()
            .optional()
            .describe(
              "Tag/category, e.g. ai, cloud, database (see list_categories)",
            ),
          min_value: z
            .number()
            .optional()
            .describe("Only perks whose max_value is at least this (USD)"),
          limit: z
            .number()
            .int()
            .positive()
            .max(100)
            .optional()
            .describe("Max results to return (default 25)"),
        },
      },
      async ({ query, audience, category, min_value, limit }) => {
        let r = data.programs;
        if (audience) r = r.filter((p) => p.audience.includes(audience));
        if (category) r = r.filter((p) => p.tags.includes(category));
        if (typeof min_value === "number")
          r = r.filter((p) => (p.max_value ?? 0) >= min_value);
        if (query) {
          const q = query.toLowerCase();
          r = r.filter(
            (p) =>
              p.title.toLowerCase().includes(q) ||
              p.provider.toLowerCase().includes(q) ||
              p.slug.toLowerCase().includes(q) ||
              p.tags.some((t) => t.toLowerCase().includes(q)),
          );
        }
        const sorted = [...r].sort(byValueDesc);
        const returned = sorted.slice(0, limit ?? 25);
        return jsonResult({
          count: sorted.length,
          returned: returned.length,
          perks: returned,
        });
      },
    );

    this.server.registerTool(
      "perks_for_persona",
      {
        description:
          "List all perks a given persona qualifies for, sorted by value (highest first). The directory's core 'I am X — what can I claim?' query.",
        inputSchema: {
          persona: z
            .enum(PERSONA_IDS)
            .describe("startup, student, oss, indie, ambassador, or nonprofit"),
        },
      },
      async ({ persona }) => {
        const perks = data.programs
          .filter((p) => p.audience.includes(persona))
          .sort(byValueDesc);
        return jsonResult({
          persona,
          label: PERSONA_LABELS[persona] ?? persona,
          count: perks.length,
          perks,
        });
      },
    );

    this.server.registerTool(
      "get_perk",
      {
        description:
          "Get one program by its slug (e.g. 'aws/aws-activate'). Returns the full record, or notFound if no such slug.",
        inputSchema: {
          slug: z.string().describe("Program slug, e.g. aws/aws-activate"),
        },
      },
      async ({ slug }) => {
        const perk = data.programs.find((p) => p.slug === slug);
        return jsonResult(perk ?? { notFound: true, slug });
      },
    );

    this.server.registerTool(
      "list_personas",
      {
        description:
          "List the personas (audiences) the directory supports, with the count of perks available to each.",
        inputSchema: {},
      },
      async () =>
        jsonResult({
          personas: Object.entries(PERSONA_LABELS).map(([id, label]) => ({
            id,
            label,
            count: data.programs.filter((p) => p.audience.includes(id)).length,
          })),
        }),
    );

    this.server.registerTool(
      "list_categories",
      {
        description:
          "List the categories (tags) used across the directory, each with how many perks carry it, sorted by frequency.",
        inputSchema: {},
      },
      async () => {
        const counts = new Map<string, number>();
        for (const p of data.programs) {
          for (const t of p.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
        }
        const categories = [...counts.entries()]
          .map(([tag, count]) => ({ tag, count }))
          .sort((a, b) => b.count - a.count);
        return jsonResult({ count: categories.length, categories });
      },
    );
  }
}

const HELP = `MakerPerks MCP server
=====================

A first-party, read-only Model Context Protocol endpoint over the MakerPerks
builder-perks directory (https://makerperks.com).

Connect (Streamable HTTP, recommended):
  claude mcp add --transport http makerperks https://mcp.makerperks.com/mcp

Endpoints:
  POST /mcp   Streamable HTTP transport (modern MCP clients)
  GET  /sse   Server-Sent Events transport (legacy clients)
  GET  /      this help page

Tools (all read-only):
  search_perks(query?, audience?, category?, min_value?, limit?)
  perks_for_persona(persona)        persona: startup|student|oss|indie|ambassador|nonprofit
  get_perk(slug)                    e.g. aws/aws-activate
  list_personas()
  list_categories()

Data: the same source of truth as https://makerperks.com/perks.json.
Public, read-only, soft rate-limited. No accounts, no auth, no tracking.
`;

const mcpHandler = MakerPerksMCP.serve("/mcp");
const sseHandler = MakerPerksMCP.serveSSE("/sse");

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/" || url.pathname === "") {
      return new Response(HELP, {
        headers: { "content-type": "text/plain; charset=utf-8" },
      });
    }

    if (
      url.pathname === "/mcp" ||
      url.pathname === "/sse" ||
      url.pathname.startsWith("/sse/")
    ) {
      // Soft per-IP rate limit to cap abuse/cost (read-only, so this is the only guard).
      const ip = request.headers.get("CF-Connecting-IP") ?? "unknown";
      const { success } = await env.RATE_LIMITER.limit({ key: ip });
      if (!success) {
        return new Response(
          "429 Too Many Requests — slow down and retry shortly.",
          {
            status: 429,
            headers: { "content-type": "text/plain; charset=utf-8" },
          },
        );
      }
      return url.pathname === "/mcp"
        ? mcpHandler.fetch(request, env, ctx)
        : sseHandler.fetch(request, env, ctx);
    }

    return new Response("Not found. See / for usage.", {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  },
};
