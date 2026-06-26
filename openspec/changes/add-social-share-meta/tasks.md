# Tasks — Add Social Share Metadata

> **Design rule:** the OG-image visual template (and the branded default) MUST be
> built through the `impeccable` skill — it's a design surface (design.md Decision 3).
> The metadata plumbing and the generator wiring are data/build and exempt.

## 1. Dependencies

- [x] 1.1 Add `satori` and `@resvg/resvg-js` (build-time only); reuse the bundled
  Inter font

## 2. Metadata in the shared head (data/build)

- [x] 2.1 Extend `Base.astro` with `image` and `canonical` props (defaults:
  `/og-default.png`; current URL)
- [x] 2.2 Emit `og:type|title|description|url|image|site_name`,
  `og:image:width|height`, and `twitter:card=summary_large_image` +
  `twitter:title|description|image`; resolve `og:url` / `og:image` to absolute via
  `Astro.site`
- [x] 2.3 Wire props on `index.astro`, `for/[audience].astro` (branded default) and
  `programs/[...slug].astro` (per-program image)

## 3. Build-time OG image generator (data/build)

- [x] 3.1 Add `src/pages/og/[...slug].png.ts` — `getStaticPaths()` over published
  programs; render the template with `satori` → `@resvg/resvg-js` → 1200×630 PNG
- [x] 3.2 Inline each provider logo from `public/logos/<slug>.png` as a data URI;
  monogram fallback when absent (mirror the card)

## 4. OG image template — via `/impeccable`

- [x] 4.1 Design the per-program OG card (logo + title + value on the brand field,
  "Trusted Ledger" tokens) through `impeccable`; browser/preview-verify the PNG
- [x] 4.2 Produce the branded default `public/og-default.png` the same way

## 5. Verify

- [x] 5.1 Built program page references its generated image; homepage/persona pages
  reference the default; all image + url meta values are absolute
- [x] 5.2 Every published program has a generated image in `dist/og/`; no broken
  references; monogram fallback renders for a logo-less provider
- [x] 5.3 Validate tags resolve in a share-preview debugger (or inspect `<head>`);
  `openspec validate add-social-share-meta --strict` passes; typecheck, lint, build green
