#!/usr/bin/env node
/**
 * Validates every program + provider YAML file against the canonical JSON Schema
 * (src/program.schema.json) and applies MakerPerks-specific scope/relationship
 * rules. Exits non-zero on any failure so CI blocks invalid data PRs.
 *
 * Run: node scripts/validate-data.mjs
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";
import Ajv from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const root = fileURLToPath(new URL("..", import.meta.url));
const programsDir = join(root, "src/content/programs");
const schema = JSON.parse(
  readFileSync(join(root, "src/program.schema.json"), "utf8"),
);

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);
const validate = ajv.compile(schema);

/** Recursively collect *.yaml / *.yml under a dir. */
function yamlFiles(dir) {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...yamlFiles(full));
    else if (/\.ya?ml$/.test(entry.name)) out.push(full);
  }
  return out;
}

const errors = [];
const warnings = [];
const seenSlugs = new Map(); // provider_slug/title -> file, dup detection
let count = 0;

for (const file of yamlFiles(programsDir)) {
  const rel = relative(root, file);
  let data;
  try {
    data = parse(readFileSync(file, "utf8"));
  } catch (e) {
    errors.push(`${rel}: YAML parse error — ${e.message}`);
    continue;
  }
  count++;

  if (!validate(data)) {
    for (const err of validate.errors ?? []) {
      errors.push(`${rel}: ${err.instancePath || "(root)"} ${err.message}`);
    }
    continue;
  }

  // --- MakerPerks rules beyond the JSON Schema ---
  // 1. aggregator => must declare what it unlocks
  if (data.aggregator && (!data.unlocks || data.unlocks.length === 0)) {
    errors.push(`${rel}: aggregator:true requires a non-empty unlocks[]`);
  }
  // 2. discount programs usually express max_value as a percentage. Source data
  //    sometimes labels a dollar-value perk "discount"; warn, don't block.
  if (data.value_type === "discount" && data.max_value > 100) {
    warnings.push(
      `${rel}: value_type:discount but max_value ${data.max_value} > 100 (dollar value mislabeled as discount?)`,
    );
  }
  // 3. tier max_value above program max_value usually signals mixed units; warn.
  for (const t of data.tiers ?? []) {
    if (typeof t.max_value === "number" && t.max_value > data.max_value) {
      warnings.push(
        `${rel}: tier "${t.name}" max_value ${t.max_value} exceeds program max_value ${data.max_value}`,
      );
    }
  }
  // 4. duplicate program key (provider_slug + title)
  const key = `${data.provider_slug}::${data.title}`.toLowerCase();
  if (seenSlugs.has(key)) {
    errors.push(
      `${rel}: duplicate program "${key}" (also ${seenSlugs.get(key)})`,
    );
  } else {
    seenSlugs.set(key, rel);
  }
}

if (warnings.length) {
  console.warn(`\n⚠ ${warnings.length} warning(s):`);
  for (const w of warnings) console.warn(`  - ${w}`);
}

if (errors.length) {
  console.error(`\n✗ Data validation failed (${errors.length} issue(s)):\n`);
  for (const e of errors) console.error(`  - ${e}`);
  console.error(`\nValidated ${count} program file(s).`);
  process.exit(1);
}

console.log(`\n✓ ${count} program file(s) valid against program.schema.json`);
