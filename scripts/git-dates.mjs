#!/usr/bin/env node
/**
 * Reports git-derived `added` (first commit) / `updated` (latest commit) dates for
 * every program record, and how many fell back to `verified` (no git history).
 *
 * The site itself computes the same map at build time via src/lib/recordDates.ts;
 * this CLI exists for CI visibility and local inspection. With `--write` it emits
 * src/data/record-dates.json for tooling that wants the map as a static artifact.
 *
 * Run: node scripts/git-dates.mjs [--write]
 */
import { execSync } from "node:child_process";
import {
  readFileSync,
  readdirSync,
  existsSync,
  mkdirSync,
  writeFileSync,
} from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";

const root = fileURLToPath(new URL("..", import.meta.url));
const programsDir = join(root, "src/content/programs");
const write = process.argv.includes("--write");

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

function gitDates(file) {
  try {
    const out = execSync(`git log --follow --format=%aI -- "${file}"`, {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    if (!out) return null;
    const lines = out.split("\n");
    return {
      updated: lines[0].slice(0, 10),
      added: lines[lines.length - 1].slice(0, 10),
    };
  } catch {
    return null;
  }
}

const map = {};
let fallback = 0;
let count = 0;

for (const file of yamlFiles(programsDir)) {
  count++;
  // entry id = path under programs dir, no extension (matches Astro glob loader)
  const id = relative(programsDir, file).replace(/\.ya?ml$/, "");
  const dates = gitDates(file);
  if (dates) {
    map[id] = { ...dates, fallback: false };
  } else {
    const verified = parse(readFileSync(file, "utf8"))?.verified ?? null;
    map[id] = { added: verified, updated: verified, fallback: true };
    fallback++;
  }
}

if (fallback > 0) {
  console.warn(
    `⚠ ${fallback}/${count} record(s) used the verified-date fallback (no git history).`,
  );
}
console.log(`✓ Derived dates for ${count} record(s) (${fallback} fallback).`);

if (write) {
  const outDir = join(root, "src/data");
  mkdirSync(outDir, { recursive: true });
  const outFile = join(outDir, "record-dates.json");
  writeFileSync(outFile, JSON.stringify(map, null, 2) + "\n");
  console.log(`  wrote ${relative(root, outFile)}`);
}
