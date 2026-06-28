# MakerPerks MCP server

A first-party, **read-only** [Model Context Protocol](https://modelcontextprotocol.io)
endpoint over the MakerPerks builder-perks directory, running as a Cloudflare Worker.

It reads the published [`perks.json`](https://makerperks.com/perks.json) — the same
source of truth as the static agent outputs — caches it briefly, and exposes
intent-shaped query tools so an agent can ask _"what can an X claim?"_ without fetching
and filtering the whole dataset.

## Endpoints

- `POST /mcp` — Streamable HTTP transport (modern MCP clients)
- `GET /sse` — Server-Sent Events transport (legacy clients)
- `GET /` — plain-text help page

Public, read-only, soft per-IP rate limit (120 req / 60s per location). No auth, no
accounts, no mutating tools.

## Tools

| Tool                | Args                                                            | Returns                       |
| ------------------- | --------------------------------------------------------------- | ----------------------------- |
| `search_perks`      | `query?`, `audience?`, `category?`, `min_value?`, `limit?`      | matching perks, value-sorted  |
| `perks_for_persona` | `persona` (startup\|student\|oss\|indie\|ambassador\|nonprofit) | perks for that persona        |
| `get_perk`          | `slug` (e.g. `aws/aws-activate`)                                | one full record               |
| `list_personas`     | —                                                               | personas + per-persona counts |
| `list_categories`   | —                                                               | tags + frequencies            |

## Connect

```sh
claude mcp add --transport http makerperks https://mcp.makerperks.com/mcp
```

## Develop

```sh
cd mcp-worker
npm install
npm run typecheck        # tsc --noEmit
npm run build            # wrangler deploy --dry-run (bundle check)
npm run dev              # local: http://localhost:8787  (try GET / for help)
```

## Deploy (Cloudflare)

Requires a Cloudflare account with `makerperks.com` as a zone (for the custom domain).
Authenticate via `wrangler login` or a `CLOUDFLARE_API_TOKEN` with Workers + DNS edit
permissions, then:

```sh
cd mcp-worker
npm install
npm run deploy           # wrangler deploy
```

`wrangler deploy` provisions the Durable Object, the rate-limit binding, and — from the
`[[routes]]` entry in `wrangler.toml` — the `mcp.makerperks.com` custom domain (it
auto-creates the DNS record). To deploy to the `*.workers.dev` URL only (no custom
domain), comment out the `[[routes]]` block first.

Data source is configured by the `PERKS_JSON_URL` var in `wrangler.toml`.
