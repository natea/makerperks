## Why

MakerPerks is "agent-native," but today agents only get *static* outputs
(`perks.json`, `llms.txt`, JSON-LD) — a whole-dataset dump they must fetch and filter
themselves. An official **Model Context Protocol (MCP) endpoint** would let an AI
agent *query* the directory directly ("what cloud credits can a seed-stage startup
claim?") through well-designed tools, which is far more useful than handing it the raw
JSON. A community server already exists (Mick Darling's `makerperks.mcpaql.com`); a
first-party endpoint under the project's control makes this a durable, documented part
of the agent layer.

## What Changes

- **Add a first-party MCP server** at `mcp.makerperks.com` (a Cloudflare Worker)
  exposing read-only tools over the existing dataset: `search_perks`,
  `perks_for_persona`, `get_perk`, `list_categories` (and value/region filters).
- **Reuse the static data** — the Worker reads the published `perks.json` (cached),
  so there's no second source of truth and it stays fresh after each deploy.
- **Streamable HTTP transport** (modern MCP) plus legacy SSE; **public, read-only,
  no auth** (a soft rate limit caps abuse).
- **Discoverable** — documented on the site's agent surfaces (`llms.txt`, a "for
  agents" mention) so agents can find it.

## Capabilities

### New Capabilities

(none — extends the existing agent-outputs capability.)

### Modified Capabilities

- `agent-outputs`: add an **interactive query interface (MCP)** alongside the static
  dataset/index files — tool-based search and lookup over the same source of truth.

## Impact

- **Affected specs:** `agent-outputs` (added requirement).
- **New code:** a `mcp-worker/` Cloudflare Worker (wrangler) using `agents`/`McpAgent`
  + `@modelcontextprotocol/sdk`, with tools over `perks.json`; `wrangler.toml` custom
  domain `mcp.makerperks.com`.
- **Infra:** a Cloudflare DNS/custom-domain binding (wrangler can auto-provision it).
- **Non-goals / follow-ups:** write/personalized tools and OAuth (read-only now);
  bundling a richer search index into the Worker; deciding whether to also endorse or
  redirect the community server. No change to the static outputs, which remain.
