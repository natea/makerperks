/**
 * Audience-accuracy rule (change: audit-program-audiences).
 *
 * A program's `audience[]` may list a persona ONLY when the program genuinely
 * serves it — i.e. the program's OWN text (title / intro / summary / description /
 * tier eligibility / url) corroborates an offering or eligibility path for that
 * persona. Appearing in an audience-themed source list is NOT corroboration on its
 * own; reconciliation MUST consult this rule before adding any audience.
 *
 * This is the single source of truth for that rule. Both `audit-audiences.mjs`
 * (reporting) and `ingest-sources.mjs` (the merge guard) import it so the report and
 * the ingest can never disagree.
 */

/**
 * Words that, in a program's own text, corroborate each audience. These are tuned to
 * the SEMANTICALLY-STRONG signal of an actual offering, deliberately excluding weak
 * terms that collide with incidental mentions:
 *   - not bare "university" (collides with training brands, e.g. "MongoDB University")
 *   - not bare "open source" (collides with "uses our open-source product")
 *   - not bare "nonprofit" (collides with "available to anyone, incl. nonprofits")
 * The excluded terms are why a startup-only program could falsely inherit a persona.
 */
export const CORROBORATION = {
  student: [
    "student",
    "education",
    "campus",
    ".edu",
    "school",
    "sheerid",
    "academic",
  ],
  oss: [
    "open source project",
    "open-source project",
    "maintainer",
    "contributor",
    "foss",
    "summer of code",
  ],
  indie: [
    "indie",
    "solo",
    "hobby",
    "side project",
    "individual developer",
    "free tier",
    "free plan",
  ],
  ambassador: [
    "ambassador",
    "advocate",
    "developer relations",
    "devrel",
    "community leader",
  ],
  nonprofit: [
    "501(c)",
    "techsoup",
    "for nonprofit",
    "for non-profit",
    "nonprofit cloud",
    "charity",
    "ngo",
    "social impact",
  ],
  // startup is the directory's default audience and is judged on funding/stage cues,
  // not a keyword list; it is never auto-stripped by the corroboration guard.
  startup: [],
};

/** All text a program states about itself, lowercased, for corroboration checks. */
export function ownText(d) {
  const parts = [d.title, d.intro, d.summary, d.description, d.url];
  for (const t of d.tiers ?? []) {
    parts.push(t.name, t.intro);
    for (const e of t.eligibility ?? []) parts.push(e);
  }
  return parts.filter(Boolean).join(" \n ").toLowerCase();
}

/**
 * Does the program's own text corroborate `audience`? `startup` always passes
 * (default audience); every other audience needs a keyword hit in the record's text.
 */
export function audienceCorroborated(d, audience) {
  if (audience === "startup") return true;
  const text = ownText(d);
  return (CORROBORATION[audience] ?? []).some((kw) => text.includes(kw));
}
