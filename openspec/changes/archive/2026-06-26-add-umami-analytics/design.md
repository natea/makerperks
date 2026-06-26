# Design — Add Umami Analytics

## Context

The site is a static Astro build with a shared layout (`Base.astro`) wrapping every
page. There is no backend and no existing analytics. PRODUCT.md's trust promise
forbids ad-tech tracking; Umami is cookieless and privacy-first, which fits.

## Goals / Non-Goals

**Goals:** site-wide pageview analytics; zero PII / cookies / consent banner; no load
or behavior change when unconfigured; trivial to enable per environment.

**Non-Goals:** custom event taxonomy / funnels (can follow later); self-hosting setup
(supported via config but not provisioned here); server-side analytics; A/B testing.

## Decisions

### Decision 1 — Inject in the shared head, gated on config

Add the Umami script to `Base.astro`'s `<head>`, rendered only when
`import.meta.env.PUBLIC_UMAMI_WEBSITE_ID` is set:

```astro
{UMAMI_ID && (
  <script defer src={UMAMI_SRC} data-website-id={UMAMI_ID}></script>
)}
```

`PUBLIC_`-prefixed env vars are the Astro convention for values that may appear in
client output — correct here since the website ID is inherently public. Unset → the
block renders nothing, so dev/forks/PR previews stay clean and builds never depend on
it. `defer` keeps it off the critical path.

**Concrete config (provided):** Umami Cloud, website ID
`fd170bfe-3e87-4a05-8658-a8b8a19311ca`, script
`https://cloud.umami.is/script.js`. The website ID is public (it ships in the page),
so it is safe to set as the default value of `PUBLIC_UMAMI_WEBSITE_ID` for the
production build; a `.env`/host env var can still override it per environment.

### Decision 2 — Umami Cloud default, self-host overridable

`PUBLIC_UMAMI_SRC` defaults to `https://cloud.umami.is/script.js`. A self-hosted
instance only needs to set that var to its own script URL; no code change. This keeps
the door open without committing the project to an instance.

### Decision 3 — Cookieless, DNT-respecting, no consent gate

Umami stores no cookies and collects no personal data, so no consent banner is
required under GDPR/ePrivacy for basic analytics. We leave Umami's default
DNT-respecting behavior on. This is the whole reason to pick Umami over GA.

## Risks / Trade-offs

- **Script blocked by ad/privacy blockers** → undercounts, never breaks the page
  (deferred, no inline dependency). Acceptable; we want directional signal, not
  exact counts.
- **Env not set in production by mistake** → no analytics, but no error. Mitigation:
  document the var in the change and verify the tag is present in the deployed head.

## Open Questions

- Whether to add a few custom events later (e.g. "redeem clicked", persona chosen).
  Out of scope here; the pageview baseline lands first.
