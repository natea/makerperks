# Design — Add Social Share Metadata

## Context

`Base.astro` already renders `<title>`, a meta description, and optional JSON-LD, and
takes `title` / `description` / `jsonLd` props. `Astro.site` is configured, so
absolute URLs are derivable. Per-provider logos are committed under `public/logos/`.
What's missing is Open Graph / Twitter metadata and an image to show. The build is
static and PR-editable; image generation must happen at build time, not runtime.

## Goals / Non-Goals

**Goals:** rich previews everywhere; a per-program image that names the actual perk;
a strong branded default; correct absolute/canonical URLs; no runtime services.

**Non-Goals:** bespoke per-persona images (default covers them); animated or
interactive cards; changing existing JSON-LD/description; a social-posting pipeline.

## Decisions

### Decision 1 — Metadata via `Base.astro` props

Extend `Base` with `image` (path or absolute URL) and `canonical` props, defaulting
`image` to `/og-default.png` and `canonical` to the current URL. Emit the standard
set: `og:type|title|description|url|image|site_name`, `og:image:width|height`, and
`twitter:card=summary_large_image` + `twitter:title|description|image`. Resolve both
`og:url` and `og:image` to absolute URLs via `Astro.site`. Each page passes the
props it already computes; program pages pass their generated image.

### Decision 2 — Build-time OG images with satori + resvg-js

Generate `1200×630` PNGs at build from a JSX/HTML template via `satori` (→ SVG) then
`@resvg/resvg-js` (→ PNG), exposed as an Astro endpoint
`src/pages/og/[...slug].png.ts` with `getStaticPaths()` over published programs. This
is the established static-OG pattern: no runtime, no headless browser, deterministic
output committed into `dist/`. ~207 small images add modest build time.

_Alternatives:_ `@vercel/og` (wraps the same satori+resvg but is edge-runtime
oriented); a headless-browser screenshot (heavy, flaky in CI); hand-made images per
program (unmaintainable at 200+). Satori+resvg is the right fit.

### Decision 3 — Image template through `impeccable`

The OG card composition (logo placement, type scale, the brand field, the value
treatment) is a visual design surface. Per CLAUDE.md it is built via the `impeccable`
skill, reusing the "Trusted Ledger" tokens (ink on true off-white, the one green
accent on the value, tabular figures). The branded default (`public/og-default.png`)
is produced the same way.

### Decision 4 — Page coverage

Homepage and persona pages (`/for/*`) use the branded default. Program detail pages
(`/programs/*` — the "provider/perks" pages) use their per-program generated image.
The `/perks.json` and other data endpoints are not HTML and are unaffected.

## Risks / Trade-offs

- **Satori font loading / emoji** → bundle one self-hosted font (Inter, already a
  dep) and avoid emoji in templates; verify glyph coverage for provider names.
- **Logo fetch in satori** → satori needs image data, not a URL; read the committed
  PNG from `public/logos/` at build and inline it (data URI). Monogram fallback when
  a provider has no logo, mirroring the card.
- **Build time for 207 images** → acceptable; if it regresses, memoize by provider
  (the logo+value rarely differ) or parallelize. Measure before optimizing.
- **Wrong/missing `Astro.site`** → relative og:image breaks scrapers. Assert it's set
  and resolve absolutely; verify one URL with a share-debugger or by inspecting tags.

## Open Questions

- Exact OG card layout (logo scale, whether to show audience/region) — resolved in
  the impeccable build pass.
- Whether to also render the headline value on the default homepage image or keep it
  purely brand — decide during the image design.
