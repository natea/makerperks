# Design — First-party MCP endpoint

## Context

The directory is static (Astro on GitHub Pages, Cloudflare in front) with no backend.
The agent layer today is `perks.json` / `llms.txt` / JSON-LD — generated at build from
the YAML source of truth. MCP's remote transport is just an HTTPS endpoint speaking
JSON-RPC (Streamable HTTP). Cloudflare Workers have first-class remote-MCP support
(`agents` SDK `McpAgent` + the official `@modelcontextprotocol/sdk`), which fits the
no-backend, pay-per-request model. A community MCP server already exists; this proposes
the official one.

## Goals / Non-Goals

**Goals:** an agent can query the directory through good tools (not a raw dump); one
source of truth (reuse `perks.json`); no standing server; public + read-only + cheap;
discoverable and documented.

**Non-Goals:** write/submit tools (that's the perk-submission flow); OAuth/personalized
results; a database; replacing the static outputs.

## Decisions

### Decision 1 — Cloudflare Worker with `McpAgent`

A `mcp-worker/` wrangler project using `agents/mcp`'s `McpAgent` and
`@modelcontextprotocol/sdk`'s `McpServer`. The Worker routes `/mcp` (Streamable HTTP)
and `/sse` (legacy) to the agent and a friendly `GET /` help page. Short-lived,
serverless, on the infra we already use.

### Decision 2 — Reuse `perks.json` as the data source

`init()` fetches `https://www.makerperks.com/perks.json` and caches it (Worker cache /
KV with a short TTL). No data duplication; the MCP reflects the latest deploy
automatically. (If latency/cost ever matters, a build-time-bundled search index is the
fallback — measure first.)

### Decision 3 — Tool design over raw access

Expose intent-shaped, read-only tools — the value over `perks.json`:
- `search_perks(query, audience?, category?, min_value?)`
- `perks_for_persona(persona)`
- `get_perk(slug)`
- `list_categories` / `list_personas`

Each returns structured JSON content. Good tools beat dumping the dataset; they map to
the product's "I am X — what can I claim?" question.

### Decision 4 — Public, read-only, rate-limited; no auth

A public directory query needs no auth. A soft per-IP rate limit caps abuse/cost.
Streamable HTTP is the primary transport; SSE kept for older clients. (OAuth is
available via Cloudflare's provider if write/personalized tools are added later.)

### Decision 5 — Domain + discoverability

`wrangler.toml` binds `routes = [{ pattern = "mcp.makerperks.com", custom_domain =
true }]`, which auto-creates the Cloudflare DNS. Document the endpoint in `llms.txt`
and the README/"for agents" surface so agents can find it. (`makerperks.dev`, reserved
for agent endpoints, is an alternative host.)

## Risks / Trade-offs

- **`perks.json` fetch latency/availability** → cache in the Worker with a TTL;
  degrade gracefully if a refresh fails (serve last-good).
- **Abuse / cost** → read-only + rate limit; no LLM calls in the Worker (pure data),
  so per-request cost is tiny.
- **Two servers (community + official)** → decide whether to coexist, endorse, or
  redirect; out of scope for the build, noted for later.
- **Protocol drift** → pin the MCP SDK; Streamable HTTP is the current standard.

## Open Questions

- Host on `mcp.makerperks.com` vs `makerperks.dev` (the reserved agent domain).
- Whether to bundle a search index for richer/faster `search_perks` vs filtering
  `perks.json` in-Worker (start simple).
- Relationship to the community server (coexist / endorse / consolidate).
