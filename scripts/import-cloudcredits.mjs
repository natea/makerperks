#!/usr/bin/env node
/**
 * One-time(ish) importer: transforms cloudcredits.io program + provider YAML into
 * MakerPerks canonical records, injecting the MakerPerks extension fields
 * (audience, region, sources, verified). Idempotent: re-running overwrites the
 * imported files from the source-of-truth tarball.
 *
 * Source tree expected at CC_SRC (default /tmp/cc_src), i.e. an extracted
 * t3-sh/cloudcredits.io checkout. See NOTICE.md for attribution (MIT).
 *
 * Run: CC_SRC=/tmp/cc_src node scripts/import-cloudcredits.mjs
 */
import {
  readFileSync,
  writeFileSync,
  readdirSync,
  mkdirSync,
  existsSync,
} from "node:fs";
import { join, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { parse, stringify } from "yaml";

const repoRoot = fileURLToPath(new URL("..", import.meta.url));
const CC = process.env.CC_SRC || "/tmp/cc_src";
const VERIFIED = "2025-10-20"; // cloudcredits.io last push date — honest provenance

const ccPrograms = join(CC, "src/content/programs");
const ccProviders = join(CC, "src/content/providers");
const outPrograms = join(repoRoot, "src/content/programs");
const outProviders = join(repoRoot, "src/content/providers");

// Only these keys survive into our canonical records (strip upstream extras like
// `date`, `success_stories`, tier `timeline_indication` / `effort`).
const ROOT_KEYS = new Set([
  "draft",
  "provider_slug",
  "title",
  "meta_title",
  "intro",
  "description",
  "status",
  "tags",
  "url",
  "value_type",
  "currency",
  "min_value",
  "max_value",
  "community_notes",
  "tiers",
  "faq",
]);
const TIER_KEYS = new Set([
  "name",
  "intro",
  "max_value",
  "url",
  "benefits",
  "benefits_level",
  "duration",
  "eligibility",
  "effort_level",
  "steps_to_apply",
]);
const STEP_KEYS = new Set(["name", "description", "action", "action_url"]);

const pick = (obj, allowed) => {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (!allowed.has(k)) continue;
    if (v === "" || v === null || v === undefined) continue; // drop empties
    out[k] = v;
  }
  return out;
};

const slugify = (s) =>
  s
    .toLowerCase()
    .replace(/\.ya?ml$/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

function walk(dir) {
  const out = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(full));
    else if (/\.ya?ml$/.test(e.name)) out.push(full);
  }
  return out;
}

// --- Providers ---
let providerCount = 0;
for (const file of walk(ccProviders)) {
  const p = parse(readFileSync(file, "utf8"));
  if (!p || !p.slug) continue;
  const rec = { slug: p.slug, name: p.name || p.short_name || p.slug };
  if (p.url) rec.url = p.url;
  mkdirSync(outProviders, { recursive: true });
  writeFileSync(join(outProviders, `${p.slug}.yaml`), stringify(rec), "utf8");
  providerCount++;
}

// --- Programs ---
let programCount = 0;
const VALUE_TYPES = new Set(["credits", "discount", "free_tier"]);
for (const file of walk(ccPrograms)) {
  const src = parse(readFileSync(file, "utf8"));
  if (!src || !src.provider_slug || !src.title) continue;

  // Ensure required fields exist for our schema.
  const intro = src.intro || src.title;
  const description = src.description || intro;
  const max_value = typeof src.max_value === "number" ? src.max_value : 0;

  // Build canonical record: whitelist base fields, then MakerPerks extensions.
  const rec = pick(src, ROOT_KEYS);
  rec.intro = intro;
  rec.description = description;
  rec.max_value = max_value;
  if (rec.value_type && !VALUE_TYPES.has(rec.value_type)) delete rec.value_type;
  if (Array.isArray(rec.tiers)) {
    rec.tiers = rec.tiers.map((t) => {
      const tier = pick(t, TIER_KEYS);
      if (Array.isArray(tier.steps_to_apply)) {
        tier.steps_to_apply = tier.steps_to_apply.map((s) =>
          pick(s, STEP_KEYS),
        );
      }
      return tier;
    });
  }

  // Extensions
  rec.audience = ["startup"];
  rec.region = "global";
  rec.sources = ["cloudcredits.io"];
  rec.verified = VERIFIED;

  const dir = join(outPrograms, src.provider_slug);
  mkdirSync(dir, { recursive: true });
  const fname = `${slugify(basename(file))}.yaml`;
  writeFileSync(join(dir, fname), stringify(rec), "utf8");
  programCount++;
}

console.log(
  `Imported ${programCount} programs and ${providerCount} providers from ${CC}`,
);
if (!existsSync(outPrograms)) process.exit(1);
