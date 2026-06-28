# Tasks — First-party MCP endpoint

> Backend/infra change (a Cloudflare Worker) — no site design surface, so `impeccable`
> is not required. **Decisions:** Cloudflare Worker + `McpAgent` · data from
> `perks.json` · Streamable HTTP (+ SSE) · public read-only + rate limit.

## 1. Worker scaffold

- [x] 1.1 Add a `mcp-worker/` wrangler project (TypeScript) using `agents`/`McpAgent`
  and `@modelcontextprotocol/sdk`
- [x] 1.2 Route `/mcp` (Streamable HTTP) and `/sse` (legacy) to the agent; a friendly
  `GET /` help page (how to connect)
- [x] 1.3 Per-IP rate limiting (KV/Cloudflare) to cap abuse; no auth (public read-only)

## 2. Data source

- [x] 2.1 `init()` fetches the published `perks.json` and caches it (Worker cache / KV
  with a TTL); serve last-good on a failed refresh

## 3. Tools (read-only)

- [x] 3.1 `search_perks(query, audience?, category?, min_value?)`
- [x] 3.2 `perks_for_persona(persona)` and `get_perk(slug)`
- [x] 3.3 `list_personas` / `list_categories`; each returns structured JSON content

## 4. Domain & discoverability

- [x] 4.1 `wrangler.toml` custom domain `mcp.makerperks.com` (auto-provisions DNS);
  decide vs `makerperks.dev`
- [x] 4.2 Document the endpoint in `llms.txt` and the README "for agents" section

## 5. Verify

- [x] 5.1 Connect from an MCP client (e.g. `claude mcp add --transport http`) and call
  each tool; results match `perks.json`
- [x] 5.2 Endpoint is read-only (no mutating tools); reflects a redeploy of the data
- [x] 5.3 Rate limit rejects abusive call volume
- [x] 5.4 `openspec validate add-mcp-endpoint --strict` passes; Worker builds/deploys

## 6. Follow-ups (OUT OF SCOPE — not tracked here)

> Plain notes, not checkboxes.

- Write/submit tools + OAuth (personalized or contribution actions).
- A build-time-bundled search index for richer/faster search.
- Decide coexistence/endorsement vs the community server (`makerperks.mcpaql.com`).
