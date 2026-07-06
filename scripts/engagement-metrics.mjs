#!/usr/bin/env node
/**
 * Engagement metrics reader — the internal marketing digest.
 *
 * Reads the engagement substrate's count endpoint and prints, per perk, the number of
 * UNIQUE visitors who engaged. Two metrics, both deduplicated by identity:
 *   - redeem-clickers : unique visitors who clicked a Redeem/apply button
 *   - savers          : unique visitors who saved the perk
 *
 * IMPORTANT — clickers, NOT clicks. Because writes are deduplicated, the substrate can
 * only ever report unique people, never raw click volume. Total redeem CLICKS live only
 * in Umami (the cookieless `redeem` event); pair the two where you share them, e.g.
 * "240 unique redeem-clickers · 380 total clicks".
 *
 * Run:  PUBLIC_ENGAGEMENT_ENDPOINT=https://…workers.dev node scripts/engagement-metrics.mjs
 *   --endpoint <url>   override the endpoint (else $PUBLIC_ENGAGEMENT_ENDPOINT)
 *   --min <n>          only perks with >= n of a metric (default 1)
 *   --json             emit machine-readable JSON instead of a table
 */

const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i !== -1 && args[i + 1] ? args[i + 1] : fallback;
};
const has = (name) => args.includes(`--${name}`);

const endpoint = (
  flag("endpoint", process.env.PUBLIC_ENGAGEMENT_ENDPOINT) ?? ""
)
  .toString()
  .replace(/\/$/, "");
const min = Math.max(1, Number(flag("min", "1")) || 1);

if (!endpoint) {
  console.error(
    "No engagement endpoint. Set PUBLIC_ENGAGEMENT_ENDPOINT or pass --endpoint <url>.",
  );
  process.exit(1);
}

/** Fetch { target: uniqueCount } for one event type at the given threshold. */
async function counts(type) {
  const url = `${endpoint}/counts?type=${encodeURIComponent(type)}&min=${min}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${type}: HTTP ${res.status} from ${url}`);
  const data = await res.json();
  return data.counts ?? {};
}

const [redeem, favorite] = await Promise.all([
  counts("redeem-click"),
  counts("favorite"),
]);

// Union of perks appearing in either metric, ranked by redeem-clickers then savers.
const perks = [...new Set([...Object.keys(redeem), ...Object.keys(favorite)])]
  .map((perk) => ({
    perk,
    redeemClickers: redeem[perk] ?? 0,
    savers: favorite[perk] ?? 0,
  }))
  .sort((a, b) => b.redeemClickers - a.redeemClickers || b.savers - a.savers);

if (has("json")) {
  console.log(JSON.stringify({ min, endpoint, perks }, null, 2));
  process.exit(0);
}

const sum = (k) => perks.reduce((n, p) => n + p[k], 0);
const pad = (s, n) => String(s).padEnd(n);
const num = (s, n) => String(s).padStart(n);

console.log(
  `Engagement metrics — unique visitors (min ${min}) — ${endpoint}\n`,
);
if (!perks.length) {
  console.log("(no perks at or above the threshold yet)");
} else {
  console.log(
    `${pad("perk", 52)} ${num("redeem-clickers", 16)} ${num("savers", 8)}`,
  );
  console.log("-".repeat(78));
  for (const p of perks)
    console.log(
      `${pad(p.perk, 52)} ${num(p.redeemClickers, 16)} ${num(p.savers, 8)}`,
    );
  console.log("-".repeat(78));
  console.log(
    `${pad(`${perks.length} perks`, 52)} ${num(sum("redeemClickers"), 16)} ${num(sum("savers"), 8)}`,
  );
}
console.log(
  "\nUnique clickers/savers (deduplicated), NOT raw clicks — total click volume is in Umami.",
);
