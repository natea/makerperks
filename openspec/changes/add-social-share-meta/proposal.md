## Why

When a MakerPerks link is shared on social platforms, group chats, or Slack, it
renders as a bare URL — no title card, no image, no description. That kills
click-through and undersells a directory whose growth depends on people sharing
"look what you can claim." The site already generates clean titles/descriptions and
has per-provider logos; it just doesn't expose Open Graph / Twitter metadata or a
share image.

## What Changes

- **Add Open Graph + Twitter Card metadata** to the shared `<head>` so every page
  produces a rich preview: title, description, canonical URL, site name, image, and
  card type. Driven by per-page props through `Base.astro`.
- **Generate a per-program share image at build time** — provider logo + program
  title + headline value on the brand field — so a shared program link previews the
  specific perk. Covers program (provider/perk) detail pages.
- **A branded default share image** for the homepage and persona pages (and any page
  without a specific image).
- **Canonical URLs + absolute image URLs** on every page (social scrapers require
  absolute URLs).
- The OG-image visual template is a design surface and is built through the
  `impeccable` skill; the metadata plumbing is not.

## Capabilities

### New Capabilities

- `social-sharing`: rich link-preview metadata (Open Graph + Twitter Card) on every
  page, backed by a build-time share image — per-program where it adds signal, a
  branded default elsewhere.

### Modified Capabilities

(none — adds a new concern; existing meta description / JSON-LD is unchanged.)

## Impact

- **Affected specs:** `social-sharing` (new).
- **Affected code:** `src/layouts/Base.astro` (OG/Twitter tags + `image`/`canonical`
  props); per-page wiring on `src/pages/index.astro`, `src/pages/for/[audience].astro`,
  and `src/pages/programs/[...slug].astro`; a build-time OG-image generator
  (e.g. an endpoint `src/pages/og/[...slug].png.ts` using `satori` + `resvg-js`), the
  provider logos already in `public/logos/`, and a committed branded default at
  `public/og-default.png`.
- **Dependencies:** `satori` (+ a font) and `@resvg/resvg-js` for SVG→PNG, build-time
  only. `Astro.site` must be set so absolute URLs resolve (it already is).
- **Non-goals:** no change to on-page content or JSON-LD; no per-persona bespoke
  images beyond the branded default (follow-up if wanted).
