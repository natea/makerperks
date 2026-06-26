#!/usr/bin/env node
/**
 * Reconciles the community source lists against the imported cloudcredits.io
 * canonical records. Two operations, both reproducible from data/reconciliation.mjs:
 *
 *   MERGES   — for a program that already exists (matched by provider_slug + a
 *              title/url hint), union new `audience`, `sources`, `region`, and set
 *              `aggregator` / `unlocks` without overwriting richer existing values.
 *   ADDITIONS— create new canonical records for builder/dev-adjacent programs the
 *              cloudcredits import lacks (the non-startup personas especially).
 *
 * Scope fence (builder + dev-adjacent only) is enforced by curation in the data
 * file: consumer/lifestyle deals are simply not present.
 *
 * Run: node scripts/ingest-sources.mjs
 */
import {
  readFileSync,
  writeFileSync,
  readdirSync,
  mkdirSync,
  existsSync,
} from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { parse, stringify } from "yaml";
import { MERGES, ADDITIONS } from "./data/reconciliation.mjs";
import { audienceCorroborated } from "./data/audience-rules.mjs";

const repoRoot = fileURLToPath(new URL("..", import.meta.url));
const programsDir = join(repoRoot, "src/content/programs");

const uniq = (arr) => [...new Set(arr)];

function walk(dir) {
  const out = [];
  if (!existsSync(dir)) return out;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(full));
    else if (/\.ya?ml$/.test(e.name)) out.push(full);
  }
  return out;
}

// Index existing programs by provider_slug -> [{file, data}]
const index = new Map();
for (const file of walk(programsDir)) {
  const data = parse(readFileSync(file, "utf8"));
  if (!data?.provider_slug) continue;
  if (!index.has(data.provider_slug)) index.set(data.provider_slug, []);
  index.get(data.provider_slug).push({ file, data });
}

function findMatch(provider_slug, titleHint) {
  const candidates = index.get(provider_slug);
  if (!candidates) return null;
  if (candidates.length === 1 && !titleHint) return candidates[0];
  if (titleHint) {
    const t = titleHint.toLowerCase();
    const hit = candidates.find((c) => c.data.title.toLowerCase().includes(t));
    if (hit) return hit;
  }
  return candidates[0] ?? null;
}

let merged = 0;
const missedMerges = [];
for (const m of MERGES) {
  const match = findMatch(m.provider_slug, m.titleHint);
  if (!match) {
    missedMerges.push(
      `${m.provider_slug}${m.titleHint ? ` (${m.titleHint})` : ""}`,
    );
    continue;
  }
  const d = match.data;
  // Audience is NOT inferred from source-list membership. A source can contribute a
  // candidate persona, but it is added only when the program's OWN text corroborates
  // an offering for it (see scripts/data/audience-rules.mjs). Audiences the record
  // already carries are always kept; uncorroborated candidates from the source are
  // dropped. This is what prevents a startup-only program that merely appeared in a
  // nonprofit/student/oss source from inheriting that persona.
  const candidates = uniq([...(d.audience ?? []), ...(m.audience ?? [])]);
  d.audience = candidates.filter(
    (a) => (d.audience ?? []).includes(a) || audienceCorroborated(d, a),
  );
  d.sources = uniq([...(d.sources ?? []), ...(m.sources ?? [])]);
  if (m.region && (!d.region || d.region === "global")) d.region = m.region;
  if (m.aggregator) {
    d.aggregator = true;
    d.unlocks = uniq([...(d.unlocks ?? []), ...(m.unlocks ?? [])]);
  }
  writeFileSync(match.file, stringify(d), "utf8");
  merged++;
}

let added = 0;
const skipped = [];
for (const a of ADDITIONS) {
  const dir = join(programsDir, a.provider_slug);
  const fname = `${a.slug}.yaml`;
  const path = join(dir, fname);
  // Don't clobber an existing canonical record; merges handle overlaps.
  if (existsSync(path)) {
    skipped.push(`${a.provider_slug}/${fname} (exists)`);
    continue;
  }
  const { slug: _slug, ...record } = a;
  mkdirSync(dir, { recursive: true });
  writeFileSync(path, stringify(record), "utf8");
  added++;
}

console.log(
  `Merged ${merged} existing program(s); added ${added} new program(s).`,
);
if (missedMerges.length)
  console.log(`  merge targets not found: ${missedMerges.join(", ")}`);
if (skipped.length) console.log(`  additions skipped: ${skipped.join(", ")}`);
