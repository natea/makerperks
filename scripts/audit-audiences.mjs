#!/usr/bin/env node
/**
 * Audience audit report (change: audit-program-audiences).
 *
 * For each NON-startup audience, lists every program tagged with it — title, url,
 * full audience[], and corroboration signals — so a reviewer can confirm the tag
 * reflects a real offering rather than mere source-list provenance.
 *
 * It flags HIGH-CONFIDENCE false positives: a record whose title screams
 * startup-only ("for Startups" / "Startup Program") yet carries a non-startup
 * audience, with no corroborating mention of that audience in its own text.
 *
 * Read-only. Exits non-zero only when contradictions remain, so task 4.2 can gate on it.
 *
 * Run: node scripts/audit-audiences.mjs
 */
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";
import { audienceCorroborated } from "./data/audience-rules.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const programsDir = join(root, "src/content/programs");

const NON_STARTUP = ["student", "oss", "indie", "ambassador", "nonprofit"];

/** Title patterns that signal a startup-only program. */
const STARTUP_TITLE = /\bfor startups?\b|\bstartup program\b|\bfor founders\b/i;

function yamlFiles(dir) {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...yamlFiles(p));
    else if (/\.ya?ml$/.test(e.name)) out.push(p);
  }
  return out;
}

const records = yamlFiles(programsDir).map((f) => ({
  rel: f.slice(root.length + 1),
  d: parse(readFileSync(f, "utf8")),
}));

let contradictions = 0;
const lines = [];

for (const audience of NON_STARTUP) {
  const tagged = records.filter((r) => (r.d.audience ?? []).includes(audience));
  lines.push("");
  lines.push(`## ${audience}  (${tagged.length} tagged)`);
  for (const r of tagged) {
    const ok = audienceCorroborated(r.d, audience);
    const startupTitle = STARTUP_TITLE.test(r.d.title ?? "");
    const falsePositive = startupTitle && !ok;
    if (falsePositive) contradictions++;
    const flag = falsePositive
      ? "❌ FALSE-POSITIVE"
      : ok
        ? "✅ corroborated"
        : "⚠️  no corroboration";
    lines.push(
      `  ${flag}  ${r.d.title}\n` +
        `      audience: [${(r.d.audience ?? []).join(", ")}]  ·  ${r.d.url}\n` +
        `      ${r.rel}`,
    );
  }
}

console.log("# Audience audit\n");
console.log(
  `${records.length} records · ${contradictions} high-confidence contradiction(s)`,
);
console.log(lines.join("\n"));

if (contradictions > 0) {
  console.log(
    `\n${contradictions} record(s) have a startup-only title but a non-startup ` +
      `audience with no corroboration in their own text. Review and correct.`,
  );
  process.exit(1);
}
