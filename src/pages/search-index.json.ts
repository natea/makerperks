import type { APIRoute } from "astro";
import { getPublishedPrograms, displayValue } from "../lib/programs";
import logoManifest from "../data/logo-manifest.json";

const hasLogo = new Set(logoManifest as string[]);

/**
 * /search-index.json — the static search index for the global command palette.
 * Generated at build time from the canonical YAML (same source as /perks.json) so
 * it never drifts; the palette fetches it once on first open. Draft programs are
 * excluded via getPublishedPrograms().
 */

/**
 * Build-time synonym groups (design.md Decision 5). If any term in a group appears
 * in a program's own text, the whole group is folded into that entry's `keywords`,
 * so a search for "postgres" reaches a record that only says "PostgreSQL", etc.
 * Hand-curated dev vocabulary — extend in a PR; not a runtime dependency.
 */
const SYNONYM_GROUPS: string[][] = [
  ["postgres", "postgresql", "pgvector"],
  ["k8s", "kubernetes"],
  ["vector database", "embeddings"],
  ["open source", "oss", "foss"],
  ["ci/cd", "continuous integration", "continuous delivery"],
  ["observability", "monitoring"],
  ["llm", "large language model", "generative ai"],
  ["authentication", "sso"],
  ["cdn", "content delivery network"],
  ["iac", "infrastructure as code"],
];

/** Whole-word/phrase test — avoids "oss" matching "across", etc. */
function mentions(hay: string, term: string): boolean {
  const esc = term.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");
  return new RegExp(`\\b${esc}\\b`, "i").test(hay);
}

/** Terms from any synonym group whose other members appear (as words) in `text`. */
function synonymKeywords(text: string): string[] {
  const out = new Set<string>();
  for (const group of SYNONYM_GROUPS) {
    if (group.some((term) => mentions(text, term))) {
      for (const term of group) if (!mentions(text, term)) out.add(term);
    }
  }
  return [...out];
}

export const GET: APIRoute = async () => {
  const programs = await getPublishedPrograms();
  const entries = programs.map((p) => {
    const d = p.data;
    const summary = d.summary ?? d.intro;
    const base = `${d.title} ${d.provider_slug} ${summary} ${d.tags.join(" ")} ${d.description}`;
    return {
      path: `/programs/${p.id}`,
      title: d.title,
      provider: d.provider_slug,
      summary,
      tags: d.tags,
      value: displayValue(d),
      audiences: d.audience,
      logo: hasLogo.has(d.provider_slug)
        ? `/logos/${d.provider_slug}.png`
        : null,
      keywords: synonymKeywords(base),
    };
  });

  return new Response(JSON.stringify(entries), {
    headers: { "content-type": "application/json; charset=utf-8" },
  });
};
