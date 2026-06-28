#!/usr/bin/env node
/**
 * Perk freshness & link-health check. For every published program it:
 *   - verifies the redeem `url` and each tier `action_url` still resolve (not a
 *     connection failure, 4xx/5xx, or a redirect to an unrelated/parked domain), and
 *   - flags records whose `verified` date is older than the staleness threshold.
 *
 * It is ADVISORY: it writes a report and exits 0. It NEVER edits program data and NEVER
 * bumps a `verified` date — a fresh date must reflect a real human re-check. The
 * scheduled workflow surfaces the report as a PR for a maintainer to review.
 *
 * Run:  node scripts/check-perk-health.mjs [--write]
 *   --write   also write reports/data-health.{md,json} (default: print summary only)
 * Env:  STALE_DAYS (default 120), HEALTH_CONCURRENCY (default 8), HEALTH_TIMEOUT_MS (8000)
 */
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
const WRITE = process.argv.includes("--write");
const STALE_DAYS = Number(process.env.STALE_DAYS ?? 120);
const CONCURRENCY = Number(process.env.HEALTH_CONCURRENCY ?? 8);
const TIMEOUT_MS = Number(process.env.HEALTH_TIMEOUT_MS ?? 8000);
const UA =
  "MakerPerksHealthCheck/1.0 (+https://makerperks.com; link freshness check)";

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

/** Naive registrable domain: last two labels (e.g. aws.amazon.com -> amazon.com). */
function registrable(host) {
  const parts = String(host)
    .toLowerCase()
    .replace(/^www\./, "")
    .split(".");
  return parts.slice(-2).join(".");
}

function hostOf(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

/**
 * Check one URL. Returns { status: "ok"|"broken"|"redirected"|"unknown", code, finalUrl }.
 * One retry on a network error or 5xx (transient). Our own failures are "unknown".
 */
async function checkUrl(url, attempt = 0) {
  try {
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      headers: { "user-agent": UA, accept: "text/html,*/*" },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    // Drain quickly without holding the body.
    res.body?.cancel?.();
    if (res.status >= 500 && attempt < 1) return checkUrl(url, attempt + 1);
    // High-precision "broken": only a definitively-gone page. 401/403/405/429 and 5xx
    // are usually anti-bot walls or transient — report as "unknown" (needs a human
    // look), not broken, so the broken list stays trustworthy and low-noise.
    if (res.status === 404 || res.status === 410)
      return { status: "broken", code: res.status, finalUrl: res.url };
    if (res.status >= 400)
      return { status: "unknown", code: res.status, finalUrl: res.url };
    const from = registrable(hostOf(url));
    const to = registrable(hostOf(res.url));
    if (from && to && from !== to)
      return { status: "redirected", code: res.status, finalUrl: res.url };
    return { status: "ok", code: res.status, finalUrl: res.url };
  } catch (err) {
    if (attempt < 1) return checkUrl(url, attempt + 1);
    return {
      status: "unknown",
      code: 0,
      finalUrl: null,
      error: String(err?.name ?? err),
    };
  }
}

/** Map over items with bounded concurrency. */
async function pool(items, limit, fn) {
  const results = new Array(items.length);
  let i = 0;
  const workers = Array.from(
    { length: Math.min(limit, items.length) },
    async () => {
      while (i < items.length) {
        const idx = i++;
        results[idx] = await fn(items[idx], idx);
      }
    },
  );
  await Promise.all(workers);
  return results;
}

// --- Load programs + collect the URLs to check ---
const programs = [];
for (const file of yamlFiles(programsDir)) {
  let d;
  try {
    d = parse(readFileSync(file, "utf8"));
  } catch {
    continue;
  }
  if (!d || d.draft) continue;
  const slug = `${d.provider_slug}/${file
    .split("/")
    .pop()
    .replace(/\.ya?ml$/, "")}`;
  const urls = new Set();
  if (d.url) urls.add(d.url);
  for (const t of d.tiers ?? [])
    for (const s of t.steps_to_apply ?? [])
      if (s.action_url) urls.add(s.action_url);
  programs.push({
    slug,
    title: d.title,
    verified: d.verified,
    file: relative(root, file),
    urls: [...urls],
  });
}

// --- Run link checks (flattened, concurrency-bounded) ---
const checkJobs = programs.flatMap((p) => p.urls.map((url) => ({ p, url })));
const checked = await pool(checkJobs, CONCURRENCY, (job) => checkUrl(job.url));

// --- Assemble issues ---
const now = Date.now();
const staleMs = STALE_DAYS * 86400_000;
const linkIssues = [];
checkJobs.forEach((job, idx) => {
  const r = checked[idx];
  if (
    r.status === "broken" ||
    r.status === "redirected" ||
    r.status === "unknown"
  ) {
    linkIssues.push({
      slug: job.p.slug,
      title: job.p.title,
      type: r.status,
      url: job.url,
      code: r.code,
      finalUrl: r.finalUrl,
      verified: job.p.verified,
      file: job.p.file,
    });
  }
});
const staleIssues = programs
  .filter((p) => p.verified && now - new Date(p.verified).getTime() > staleMs)
  .map((p) => ({
    slug: p.slug,
    title: p.title,
    verified: p.verified,
    ageDays: Math.round((now - new Date(p.verified).getTime()) / 86400_000),
    file: p.file,
  }))
  .sort((a, b) => b.ageDays - a.ageDays);

const generated = new Date().toISOString().slice(0, 10);
const counts = {
  programs: programs.length,
  urls_checked: checkJobs.length,
  broken: linkIssues.filter((i) => i.type === "broken").length,
  redirected: linkIssues.filter((i) => i.type === "redirected").length,
  unknown: linkIssues.filter((i) => i.type === "unknown").length,
  stale: staleIssues.length,
};
const clean = counts.broken + counts.redirected + counts.stale === 0;

const json = {
  generated,
  stale_days: STALE_DAYS,
  counts,
  link_issues: linkIssues,
  stale: staleIssues,
};

// --- Markdown report ---
function table(rows, header, line) {
  if (!rows.length) return "_None._\n";
  return (
    [
      `| ${header.join(" | ")} |`,
      `| ${header.map(() => "---").join(" | ")} |`,
      ...rows.map(line),
    ].join("\n") + "\n"
  );
}
const md = [
  `# Data health report`,
  ``,
  `_Generated ${generated} · ${counts.programs} programs · ${counts.urls_checked} URLs checked · staleness threshold ${STALE_DAYS} days._`,
  ``,
  clean
    ? `✅ **All healthy** — no broken links, no off-domain redirects, nothing past the staleness threshold.`
    : `⚠️ **${counts.broken} broken**, **${counts.redirected} redirected off-domain**, **${counts.unknown} unverifiable**, **${counts.stale} stale**.`,
  ``,
  `> Advisory only. \`verified\` dates are never changed automatically — a maintainer reviews and re-verifies.`,
  ``,
  `## Broken links`,
  table(
    linkIssues.filter((i) => i.type === "broken"),
    ["Program", "URL", "Status", "Last verified"],
    (i) =>
      `| ${i.title} (\`${i.slug}\`) | ${i.url} | ${i.code} | ${i.verified} |`,
  ),
  `## Redirected off-domain (review — may be a moved/parked page)`,
  table(
    linkIssues.filter((i) => i.type === "redirected"),
    ["Program", "URL → final", "Last verified"],
    (i) =>
      `| ${i.title} (\`${i.slug}\`) | ${i.url} → ${i.finalUrl} | ${i.verified} |`,
  ),
  `## Stale — due for re-verification (> ${STALE_DAYS} days)`,
  table(
    staleIssues,
    ["Program", "Last verified", "Age (days)"],
    (i) => `| ${i.title} (\`${i.slug}\`) | ${i.verified} | ${i.ageDays} |`,
  ),
  `## Unverifiable (our check failed — transient/bot-wall, not necessarily broken)`,
  table(
    linkIssues.filter((i) => i.type === "unknown"),
    ["Program", "URL", "Code", "Last verified"],
    (i) =>
      `| ${i.title} (\`${i.slug}\`) | ${i.url} | ${i.code || "net err"} | ${i.verified} |`,
  ),
].join("\n");

// --- Output ---
console.log(
  `Checked ${counts.urls_checked} URLs across ${counts.programs} programs: ` +
    `${counts.broken} broken, ${counts.redirected} redirected, ${counts.unknown} unknown, ${counts.stale} stale.`,
);
if (WRITE) {
  const dir = join(root, "reports");
  mkdirSync(dir, { recursive: true });
  writeFileSync(
    join(dir, "data-health.json"),
    JSON.stringify(json, null, 2) + "\n",
  );
  writeFileSync(join(dir, "data-health.md"), md + "\n");
  console.log("Wrote reports/data-health.md and reports/data-health.json");
}
// Advisory: always exit 0 (the workflow decides what to do with findings).
