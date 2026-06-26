import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import type { Program } from "./programs";

/**
 * Build-time `added` / `updated` dates per program, derived from git history
 * (Decision 1). `added` = the file's first commit, `updated` = its latest commit.
 * Nothing is written back into the YAML — these are computed at build/dev only.
 *
 * Fallback: when git history is unavailable (shallow clone, or an as-yet
 * uncommitted file), both dates fall back to the record's `verified` date. The
 * count that fell back is reported via `getRecordDates`' return so the caller can
 * surface a degraded build instead of silently mis-sorting.
 */
export interface RecordDate {
  added: string; // YYYY-MM-DD
  updated: string; // YYYY-MM-DD
  fallback: boolean;
}

// Project root. Anchored on the working directory (where `astro dev`/`build` run)
// rather than `import.meta.url`, which Vite's SSR bundling rewrites — that made
// every file lookup miss and silently fall back to the verified date.
const root = process.cwd();

/** Resolve the YAML path for a program entry id (`<provider>/<file>`). */
function programFile(id: string): string | null {
  for (const ext of [".yaml", ".yml"]) {
    const p = join(root, "src/content/programs", id + ext);
    if (existsSync(p)) return p;
  }
  return null;
}

/** First/last commit ISO dates for one file, or null when git has no history. */
function gitDates(file: string): { added: string; updated: string } | null {
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

let cache: Map<string, RecordDate> | null = null;
let fallbackCount = 0;
let reported = false;

/**
 * Map of program id → { added, updated, fallback }. Computed once per process and
 * cached (the program set is stable within a build). Logs the fallback count once.
 */
export function getRecordDates(programs: Program[]): Map<string, RecordDate> {
  if (cache) return cache;
  cache = new Map();
  fallbackCount = 0;

  for (const p of programs) {
    const file = programFile(p.id);
    const dates = file ? gitDates(file) : null;
    if (dates) {
      cache.set(p.id, { ...dates, fallback: false });
    } else {
      const v = p.data.verified;
      cache.set(p.id, { added: v, updated: v, fallback: true });
      fallbackCount++;
    }
  }

  if (!reported) {
    reported = true;
    if (fallbackCount > 0) {
      console.warn(
        `[record-dates] ${fallbackCount}/${programs.length} record(s) used the ` +
          `verified-date fallback (no git history). Date sorts are approximate ` +
          `until the records are committed.`,
      );
    }
  }
  return cache;
}
