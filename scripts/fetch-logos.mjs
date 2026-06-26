#!/usr/bin/env node
/**
 * Fetches one logo per provider and commits it under public/logos/<slug>.png.
 *
 * Source: Logo.dev (https://img.logo.dev/<domain>?token=<pk>&size=128&format=png),
 * with a Google-favicon fallback. The domain is parsed from each provider's program
 * `url`. Logos are keyed by provider_slug so multi-program vendors fetch once.
 *
 * The publishable token is read from .env (LOGO_DEV_TOKEN) at build/seed time only;
 * the committed images carry no token, so nothing secret reaches the shipped site.
 *
 * Idempotent: skips providers whose logo already exists unless --refresh is passed.
 * Writes src/data/logo-manifest.json (the slugs that have a logo) for the card to
 * decide logo-vs-monogram, and sets `logo:` on each provider record.
 *
 * Run: node scripts/fetch-logos.mjs [--refresh]
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
const providersDir = join(root, "src/content/providers");
const logosDir = join(root, "public/logos");
const refresh = process.argv.includes("--refresh");

// --- token (.env, build-time only) ---
function readEnvToken() {
  if (process.env.LOGO_DEV_TOKEN) return process.env.LOGO_DEV_TOKEN.trim();
  const envFile = join(root, ".env");
  if (!existsSync(envFile)) return null;
  for (const line of readFileSync(envFile, "utf8").split("\n")) {
    const m = line.match(/^\s*LOGO_DEV_TOKEN\s*=\s*(.+?)\s*$/);
    if (m) return m[1].replace(/^["']|["']$/g, "");
  }
  return null;
}
const token = readEnvToken();
if (!token) {
  console.error("✗ LOGO_DEV_TOKEN not found in env or .env. Aborting.");
  process.exit(1);
}

function yamlFiles(dir) {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, e.name);
    if (e.isDirectory()) out.push(...yamlFiles(full));
    else if (/\.ya?ml$/.test(e.name)) out.push(full);
  }
  return out;
}

function domainFromUrl(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

// --- provider -> domain, from the first program record of that provider ---
const providerDomain = new Map();
for (const file of yamlFiles(programsDir)) {
  const d = parse(readFileSync(file, "utf8"));
  if (!d?.provider_slug || !d?.url) continue;
  if (!providerDomain.has(d.provider_slug)) {
    const dom = domainFromUrl(d.url);
    if (dom) providerDomain.set(d.provider_slug, dom);
  }
}

async function fetchImage(url) {
  try {
    const res = await fetch(url, { redirect: "follow" });
    if (!res.ok) return null;
    const type = res.headers.get("content-type") || "";
    if (!/image\//.test(type)) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    return buf.length > 0 ? buf : null;
  } catch {
    return null;
  }
}

async function acquire(domain) {
  const logoDev = `https://img.logo.dev/${domain}?token=${token}&size=128&format=png&retina=true`;
  let buf = await fetchImage(logoDev);
  if (buf) return { buf, source: "logo.dev" };
  const favicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  buf = await fetchImage(favicon);
  if (buf) return { buf, source: "favicon" };
  return null;
}

// --- simple concurrency pool ---
async function pool(items, size, worker) {
  const results = [];
  let i = 0;
  const runners = Array.from({ length: size }, async () => {
    while (i < items.length) {
      const idx = i++;
      results[idx] = await worker(items[idx], idx);
    }
  });
  await Promise.all(runners);
  return results;
}

mkdirSync(logosDir, { recursive: true });

const slugs = [...providerDomain.keys()].sort();
const have = [];
const misses = [];
let fetched = 0;
let skipped = 0;
const bySource = { "logo.dev": 0, favicon: 0 };

await pool(slugs, 8, async (slug) => {
  const out = join(logosDir, `${slug}.png`);
  if (existsSync(out) && !refresh) {
    have.push(slug);
    skipped++;
    return;
  }
  const domain = providerDomain.get(slug);
  const got = await acquire(domain);
  if (got) {
    writeFileSync(out, got.buf);
    have.push(slug);
    fetched++;
    bySource[got.source]++;
  } else {
    misses.push(`${slug} (${domain})`);
  }
});

// --- manifest the card reads ---
mkdirSync(join(root, "src/data"), { recursive: true });
const manifestFile = join(root, "src/data/logo-manifest.json");
writeFileSync(manifestFile, JSON.stringify(have.sort(), null, 2) + "\n");

// --- record logo path on provider records that have one ---
for (const file of yamlFiles(providersDir)) {
  const raw = readFileSync(file, "utf8");
  const d = parse(raw);
  if (!d?.slug || !have.includes(d.slug)) continue;
  const path = `/logos/${d.slug}.png`;
  if (d.logo === path) continue;
  if (/^logo:/m.test(raw)) {
    writeFileSync(file, raw.replace(/^logo:.*$/m, `logo: ${path}`));
  } else {
    writeFileSync(file, raw.replace(/\n*$/, `\nlogo: ${path}\n`));
  }
}

console.log(
  `\n✓ Logos: ${have.length}/${slugs.length} providers covered ` +
    `(${fetched} fetched, ${skipped} already present).`,
);
console.log(
  `  sources: logo.dev=${bySource["logo.dev"]}, favicon=${bySource.favicon}`,
);
console.log(`  manifest: ${relative(root, manifestFile)}`);
if (misses.length) {
  console.warn(
    `\n⚠ ${misses.length} provider(s) with no logo (monogram fallback):`,
  );
  for (const m of misses) console.warn(`  - ${m}`);
}
