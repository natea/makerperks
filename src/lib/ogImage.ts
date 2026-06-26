import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

/**
 * Build-time Open Graph image generator (1200×630) for the social-sharing change.
 * Renders a "Trusted Ledger" card via satori → resvg. Colors are concrete hex
 * approximations of the OKLCH tokens (satori needs literal colors). Anchored on
 * process.cwd() rather than import.meta.url, which Vite's SSR bundling rewrites.
 */

const root = process.cwd();
const FONT_DIR = join(root, "src/assets/fonts");

// Trusted Ledger palette (hex ≈ the global.css OKLCH tokens).
const C = {
  paper: "#fbfbfb",
  ink: "#26292f",
  inkMuted: "#6a7077",
  green: "#1f9e57",
  greenInk: "#176c3e",
  hairline: "#e4e7ea",
  surface: "#f3f5f6",
};

let fontsCache:
  | { name: string; data: Buffer; weight: 400 | 600; style: "normal" }[]
  | null = null;
function fonts() {
  if (!fontsCache) {
    fontsCache = [
      {
        name: "Inter",
        data: readFileSync(join(FONT_DIR, "Inter-Regular.woff")),
        weight: 400,
        style: "normal",
      },
      {
        name: "Inter",
        data: readFileSync(join(FONT_DIR, "Inter-SemiBold.woff")),
        weight: 600,
        style: "normal",
      },
    ];
  }
  return fontsCache;
}

/** Provider logo as a data URI, or null when the provider has no committed logo. */
function logoDataUri(providerSlug: string): string | null {
  const p = join(root, "public/logos", `${providerSlug}.png`);
  if (!existsSync(p)) return null;
  return `data:image/png;base64,${readFileSync(p).toString("base64")}`;
}

// Minimal satori node helpers (no JSX in a .ts endpoint).
type Node = { type: string; props: Record<string, unknown> };
const el = (
  type: string,
  style: Record<string, unknown>,
  children?: unknown,
): Node => ({
  type,
  props: { style, ...(children !== undefined ? { children } : {}) },
});

const wordmark = () =>
  el("div", { display: "flex", alignItems: "center", gap: 14 }, [
    el("div", {
      width: 30,
      height: 30,
      borderRadius: 8,
      backgroundColor: C.green,
    }),
    el("div", { fontSize: 30, fontWeight: 600, color: C.ink }, "MakerPerks"),
  ]);

function frame(children: unknown[]) {
  return el(
    "div",
    {
      width: 1200,
      height: 630,
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      padding: 72,
      backgroundColor: C.paper,
      fontFamily: "Inter",
      color: C.ink,
    },
    children,
  );
}

/** Per-program card: provider logo + title + headline value. */
function programCard(opts: { title: string; provider: string; value: string }) {
  const logo = logoDataUri(opts.provider);
  const brandRow = el(
    "div",
    { display: "flex", alignItems: "center", gap: 22 },
    [
      logo
        ? {
            type: "img",
            props: {
              src: logo,
              width: 104,
              height: 104,
              style: {
                borderRadius: 18,
                border: `1px solid ${C.hairline}`,
                backgroundColor: "#ffffff",
                objectFit: "contain",
                padding: 10,
              },
            },
          }
        : el(
            "div",
            {
              width: 104,
              height: 104,
              borderRadius: 18,
              backgroundColor: C.surface,
              border: `1px solid ${C.hairline}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 48,
              fontWeight: 600,
              color: C.inkMuted,
            },
            opts.provider.charAt(0).toUpperCase(),
          ),
      el(
        "div",
        { fontSize: 30, color: C.inkMuted, textTransform: "capitalize" },
        opts.provider,
      ),
    ],
  );
  const body = el(
    "div",
    { display: "flex", flexDirection: "column", gap: 26 },
    [
      el(
        "div",
        {
          fontSize: 64,
          fontWeight: 600,
          lineHeight: 1.05,
          letterSpacing: "-0.02em",
          display: "flex",
        },
        opts.title,
      ),
      el("div", { fontSize: 40, fontWeight: 600, color: C.green }, opts.value),
    ],
  );
  const foot = el(
    "div",
    { display: "flex", alignItems: "center", justifyContent: "space-between" },
    [
      wordmark(),
      el(
        "div",
        { fontSize: 24, color: C.inkMuted },
        "builder perks worth claiming",
      ),
    ],
  );
  return frame([brandRow, body, foot]);
}

/** Branded default card for the homepage / persona pages. */
function defaultCard() {
  const body = el(
    "div",
    { display: "flex", flexDirection: "column", gap: 24 },
    [
      el(
        "div",
        {
          fontSize: 68,
          fontWeight: 600,
          lineHeight: 1.05,
          letterSpacing: "-0.02em",
          maxWidth: 920,
          display: "flex",
        },
        "The free credits and tools you're already eligible for.",
      ),
      el(
        "div",
        { fontSize: 32, color: C.inkMuted },
        "200+ builder perks for startups, students, OSS, indie devs & non-profits.",
      ),
    ],
  );
  const foot = el(
    "div",
    { display: "flex", alignItems: "center", justifyContent: "space-between" },
    [
      wordmark(),
      el(
        "div",
        { fontSize: 24, color: C.greenInk, fontWeight: 600 },
        "no ads · no affiliate links",
      ),
    ],
  );
  return frame([body, foot]);
}

async function toPng(node: Node): Promise<Uint8Array<ArrayBuffer>> {
  const svg = await satori(node as unknown as Parameters<typeof satori>[0], {
    width: 1200,
    height: 630,
    fonts: fonts(),
  });
  const png = new Resvg(svg, { fitTo: { mode: "width", value: 1200 } })
    .render()
    .asPng();
  // Copy into a fresh ArrayBuffer-backed array so it's a valid Response BodyInit
  // (avoids the Uint8Array<ArrayBufferLike> vs <ArrayBuffer> typed-array mismatch).
  const out = new Uint8Array(png.byteLength);
  out.set(png);
  return out;
}

export const renderProgramOg = (opts: {
  title: string;
  provider: string;
  value: string;
}) => toPng(programCard(opts));

export const renderDefaultOg = () => toPng(defaultCard());
