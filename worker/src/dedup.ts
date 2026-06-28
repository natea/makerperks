/**
 * Pre-submit dedup: fetch the published perks.json and flag a likely duplicate of the
 * candidate by official URL domain, provider_slug, or title. Surfaced to the user in
 * the review form so they don't open a duplicate PR.
 */
import type { PerkRecord } from "./schema";

interface PublishedPerk {
  slug: string;
  title: string;
  provider: string;
  url: string;
}

export interface DuplicateMatch {
  slug: string;
  title: string;
  provider: string;
  reason: "url-domain" | "provider+title" | "title";
}

function domain(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return null;
  }
}

const norm = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();

export async function findDuplicate(
  perksJsonUrl: string,
  candidate: Pick<PerkRecord, "url" | "provider_slug" | "title">,
): Promise<DuplicateMatch | null> {
  let programs: PublishedPerk[] = [];
  try {
    const res = await fetch(perksJsonUrl, {
      cf: { cacheTtl: 300, cacheEverything: true },
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return null; // fail open: dedup is advisory, never blocks on infra error
    programs = ((await res.json()) as { programs?: PublishedPerk[] }).programs ?? [];
  } catch {
    return null;
  }

  const candDomain = domain(candidate.url);
  const candTitle = norm(candidate.title);
  const candProvider = candidate.provider_slug.toLowerCase();

  for (const p of programs) {
    if (norm(p.title) === candTitle) {
      if (p.provider.toLowerCase() === candProvider)
        return { slug: p.slug, title: p.title, provider: p.provider, reason: "provider+title" };
      return { slug: p.slug, title: p.title, provider: p.provider, reason: "title" };
    }
  }
  if (candDomain) {
    for (const p of programs) {
      if (domain(p.url) === candDomain && p.provider.toLowerCase() === candProvider)
        return { slug: p.slug, title: p.title, provider: p.provider, reason: "url-domain" };
    }
  }
  return null;
}
