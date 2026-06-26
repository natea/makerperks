# Tasks — Add Umami Analytics

> Pure instrumentation, no design surface — the `impeccable` skill is not required.

## 1. Inject the script

- [x] 1.1 In `src/layouts/Base.astro`, read `PUBLIC_UMAMI_WEBSITE_ID` (default the
  production value `fd170bfe-3e87-4a05-8658-a8b8a19311ca`) and `PUBLIC_UMAMI_SRC`
  (default `https://cloud.umami.is/script.js`) from `import.meta.env`
- [x] 1.2 Render `<script defer src={SRC} data-website-id={ID}>` in `<head>` only
  when an ID is present; render nothing when it is empty

## 2. Document config

- [x] 2.1 Add `PUBLIC_UMAMI_WEBSITE_ID` / `PUBLIC_UMAMI_SRC` to `.env.example` (create
  if absent) with a one-line comment; never commit a `.env`

## 3. Verify

- [x] 3.1 Build with the ID set → the deferred Umami tag with the correct
  `data-website-id` appears in every page's `<head>` (`dist/**/index.html`)
- [x] 3.2 Build with the ID unset → no analytics tag is emitted, build still green
- [x] 3.3 Confirm no cookie is set by the script and no consent banner is introduced
- [x] 3.4 `openspec validate add-umami-analytics --strict` passes; typecheck + build green
