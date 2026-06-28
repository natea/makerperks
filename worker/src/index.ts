/**
 * MakerPerks contribute Worker — the server side of the paste-a-URL submission flow.
 *
 *   POST /extract  { url, turnstileToken }            → schema fields + confidence + dup
 *   POST /submit   { record, turnstileToken, note? }  → opens a GitHub PR, returns its URL
 *   GET  /                                            → plain-text help
 *
 * Public + abuse-resistant: Turnstile + per-IP rate limit reject before any fetch / LLM
 * / PR work. CORS is allowlisted to the site origin(s). All publishing secrets live as
 * Worker secrets; the static site holds none. Nothing is ever auto-published — /submit
 * only opens a PR for human review.
 */
import { extract } from "./extract";
import { findDuplicate } from "./dedup";
import { openPr, type GitHubEnv } from "./github";
import {
  validateRecord,
  outOfScopeReason,
  slugify,
  type PerkRecord,
} from "./schema";
import { recordToYaml, providerToYaml } from "./yaml";

interface Env extends GitHubEnv {
  ANTHROPIC_API_KEY: string;
  ANTHROPIC_MODEL: string;
  TURNSTILE_SECRET: string;
  ALLOWED_ORIGINS: string;
  PERKS_JSON_URL: string;
  RATE_LIMITER: { limit(opts: { key: string }): Promise<{ success: boolean }> };
}

function corsHeaders(origin: string | null, allowed: string[]): Record<string, string> {
  const ok = origin && allowed.includes(origin);
  return {
    "access-control-allow-origin": ok ? (origin as string) : allowed[0] ?? "",
    "access-control-allow-methods": "POST, OPTIONS",
    "access-control-allow-headers": "content-type",
    "access-control-max-age": "86400",
    vary: "origin",
  };
}

function json(body: unknown, status: number, cors: Record<string, string>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", ...cors },
  });
}

async function verifyTurnstile(secret: string, token: string, ip: string): Promise<boolean> {
  if (!token) return false;
  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ secret, response: token, remoteip: ip }),
  });
  if (!res.ok) return false;
  return Boolean(((await res.json()) as { success?: boolean }).success);
}

const HELP = `MakerPerks contribute API
=========================
POST /extract  { url, turnstileToken }            -> proposed schema fields + dedup
POST /submit   { record, turnstileToken, note? }  -> opens a GitHub PR (needs review)

Public, Turnstile-protected, rate-limited. Nothing is auto-published — submissions
become pull requests a maintainer reviews. See /contribute on the site.
`;

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const origin = request.headers.get("origin");
    const allowed = (env.ALLOWED_ORIGINS ?? "").split(",").map((s) => s.trim()).filter(Boolean);
    const cors = corsHeaders(origin, allowed);

    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });

    if (request.method === "GET" && url.pathname === "/") {
      return new Response(HELP, { headers: { "content-type": "text/plain; charset=utf-8" } });
    }

    if (url.pathname !== "/extract" && url.pathname !== "/submit") {
      return json({ error: "not found" }, 404, cors);
    }
    if (request.method !== "POST") return json({ error: "method not allowed" }, 405, cors);

    // CORS: reject non-allowlisted origins (browser calls always send Origin).
    if (origin && !allowed.includes(origin)) {
      return json({ error: "origin not allowed" }, 403, cors);
    }

    // Abuse gate FIRST — before any fetch / LLM / PR work.
    const ip = request.headers.get("CF-Connecting-IP") ?? "unknown";
    const { success } = await env.RATE_LIMITER.limit({ key: ip });
    if (!success) return json({ error: "rate limited — slow down" }, 429, cors);

    let payload: Record<string, unknown>;
    try {
      payload = (await request.json()) as Record<string, unknown>;
    } catch {
      return json({ error: "invalid JSON body" }, 400, cors);
    }

    const okHuman = await verifyTurnstile(
      env.TURNSTILE_SECRET,
      String(payload.turnstileToken ?? ""),
      ip,
    );
    if (!okHuman) return json({ error: "human verification failed" }, 403, cors);

    try {
      if (url.pathname === "/extract") return await handleExtract(env, payload, cors);
      return await handleSubmit(env, payload, cors);
    } catch (err) {
      const message = err instanceof Error ? err.message : "unexpected error";
      return json({ error: message }, 502, cors);
    }
  },
};

async function handleExtract(
  env: Env,
  payload: Record<string, unknown>,
  cors: Record<string, string>,
): Promise<Response> {
  const target = String(payload.url ?? "").trim();
  if (!/^https?:\/\//.test(target)) return json({ error: "a valid http(s) url is required" }, 400, cors);

  const result = await extract(env, target);

  if (result.out_of_scope) {
    return json(
      {
        out_of_scope: true,
        reason:
          result.out_of_scope_reason ??
          "This looks like a consumer/lifestyle offer, outside the builder + dev-adjacent scope.",
      },
      200,
      cors,
    );
  }

  const duplicate = await findDuplicate(env.PERKS_JSON_URL, result.record);
  return json(
    { out_of_scope: false, record: result.record, confidence: result.confidence, duplicate },
    200,
    cors,
  );
}

async function handleSubmit(
  env: Env,
  payload: Record<string, unknown>,
  cors: Record<string, string>,
): Promise<Response> {
  const record = payload.record as PerkRecord | undefined;
  const note = typeof payload.note === "string" ? payload.note.slice(0, 500) : "";
  const providerName =
    typeof payload.providerName === "string" && payload.providerName.trim()
      ? payload.providerName.trim()
      : undefined;

  if (!record) return json({ error: "record is required" }, 400, cors);

  // Re-validate server-side — never trust the client.
  const errors = validateRecord(record);
  if (errors.length) return json({ error: "validation failed", details: errors }, 422, cors);

  const scope = outOfScopeReason(record);
  if (scope) return json({ error: "out of scope", details: [scope] }, 422, cors);

  const slug = slugify(record.title);
  const providerSlug = record.provider_slug;
  const branch = `suggest/${providerSlug}-${slug}`;
  const files = [
    {
      path: `src/content/programs/${providerSlug}/${slug}.yaml`,
      content: recordToYaml(record),
    },
  ];

  // Add a provider record if this provider is new (best-effort; the build also handles it).
  const providerNew = payload.providerNew === true;
  if (providerNew) {
    files.push({
      path: `src/content/providers/${providerSlug}.yaml`,
      content: providerToYaml({
        slug: providerSlug,
        name: providerName ?? record.title,
        url: record.url,
      }),
    });
  }

  const body = [
    `Submitted via the paste-a-URL contribute flow (agent-extracted, **needs review**).`,
    ``,
    `- Source URL: ${record.url}`,
    `- Provider: \`${providerSlug}\``,
    note ? `- Submitter note: ${note}` : ``,
    ``,
    `CI \`validate-data\` runs on this PR. Please verify the offer is real and current before merging.`,
  ]
    .filter(Boolean)
    .join("\n");

  const pr = await openPr(env, {
    branch,
    title: `Add ${record.title} (${providerSlug})`,
    body,
    files,
  });

  return json({ ok: true, pr: pr.url, number: pr.number }, 200, cors);
}
