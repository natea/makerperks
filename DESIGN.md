## <!-- SEED: re-run /impeccable document once there's code to capture the actual tokens and components. -->

name: MakerPerks
description: A browseable, agent-friendly directory of builder perks — trustworthy, precise, scannable.

---

# Design System: MakerPerks

## 1. Overview

**Creative North Star: "The Trusted Ledger"**

MakerPerks looks like a precise, current record you can act on with confidence —
a ledger of real value, not a marketing page about value. The feeling is calm
authority: someone is claiming actual money through this, so every screen reads as
dependable and exact. Restraint is the whole strategy. A true off-white field
(chroma 0 — explicitly **not** cream), near-black ink, and a single confident
value-green accent that appears only where it means something: a dollar amount,
a primary action, the persona you've selected. The reference point is **Linear** —
restrained color, impeccable hierarchy, nothing decorative that isn't load-bearing.

Density serves scanning. The core job is comparison — "which of these do I qualify
for, and which is worth the most?" — so the layout favors quiet, aligned rows and
cards that show enough (value, audience, effort, freshness) to decide without a
click, reserving depth for the detail page. Motion is **Responsive**: state changes
and transitions that confirm an action, never choreography that performs.

This system explicitly rejects four things (see Do's and Don'ts): generic
SaaS-cream AI slop, a plain unstyled markdown awesome-list, a cluttered
coupon/deals site, and stiff corporate enterprise gray. It is none of those —
it is a precise index a builder trusts and bookmarks.

**Key Characteristics:**

- Restrained: ink on true off-white, one accent on ≤10% of any screen.
- Value-green accent reserved for money, primary actions, and active persona.
- Single technical-humanist sans; hierarchy from weight and size, not many fonts.
- Built to scan and compare; depth lives on the detail page.
- Trust signals (verified date, eligibility, caveats) are first-class, never hidden.

## 2. Colors

A near-monochrome ink-on-paper field with a single deliberate accent. The discipline
is the point: color carries meaning, not decoration.

### Primary

- **Value Green** (`[deep, considered green — to be resolved during implementation;
OKLCH, not neon, not lime]`): the one accent. Reserved for dollar values, primary
  CTAs ("Claim", "Redeem"), and the currently-selected persona. Connotes money,
  credits, and go. Never used as a passive background tint.

### Neutral

- **Ink** (`[near-black — to be resolved]`): body text and headings. Pushed toward
  the ink end of the ramp so dense data stays legible (the body must clear 4.5:1).
- **Paper** (`[true off-white, chroma 0 — to be resolved]`): the page field.
  Explicitly not cream/sand/beige.
- **Surface** (`[faint cool-tinted neutral — to be resolved]`): cards and grouped
  rows, separated from Paper by a hair of tone, not a heavy shadow.
- **Hairline** (`[low-contrast border — to be resolved]`): 1px dividers and card
  borders. The structure is drawn with thin lines, not fills.
- **Muted Ink** (`[mid-gray with enough contrast — to be resolved]`): secondary
  metadata (verified dates, source labels). Must still clear 4.5:1 — no light-gray
  "for elegance".

### Named Rules

**The One Accent Rule.** Value-green appears on ≤10% of any screen. Its rarity is
what makes a dollar amount or a CTA read as significant. The moment two things
compete for it, neither wins.

**The Meaning-Not-Decoration Rule.** Status, region, and audience are never carried
by hue alone — always paired with text or an icon (WCAG AA; color-blind safe).

## 3. Typography

**Display / Body / Label Font:** a single technical-humanist sans
`[family to be chosen at implementation — e.g. Inter, Geist, or similar]` with a
system fallback stack. One family, full weight range.

**Character:** precise and quietly confident — engineered, not decorative. Hierarchy
comes from weight and size, never from a second clashing family.

### Hierarchy

- **Display** (`[weight ~600, clamp max ≤ ~3.5rem, tight but ≥ -0.02em]`): page and
  persona headers. Restrained — this is a reference, not a billboard.
- **Headline** (`[~600, ~1.75rem]`): section headers (categories, gateways).
- **Title** (`[~600, ~1.1rem]`): program names on cards and detail pages.
- **Body** (`[~400, ~1rem, line-height ~1.6]`): descriptions and eligibility prose.
  Cap measure at 65–75ch.
- **Label** (`[~500, ~0.8rem]`): metadata, badges, table headers. Sentence case —
  **not** wide-tracked all-caps eyebrows.
- **Numeric / Value** (`[~600, tabular figures]`): dollar amounts. Tabular numerals
  so values align in columns and compare cleanly.

### Named Rules

**The Tabular Value Rule.** Every credit amount uses tabular figures so a column of
"$100,000 / $25,000 / $5,000" aligns on the digit. Comparison is the product.

**The No-Eyebrow Rule.** No tiny uppercase tracked kicker above sections. Hierarchy
is carried by weight and size, not by 2023-era scaffolding.

## 4. Elevation

Flat by default. Depth is conveyed through tonal layering (Paper vs. Surface) and
1px hairlines, not drop shadows. This matches the restrained, ledger-like posture —
a precise document, not a stack of floating glass cards. Shadows, if they appear at
all, are a quiet response to **state** (a hovered or focused interactive element),
never an ambient decoration at rest.

### Named Rules

**The Flat-By-Default Rule.** Surfaces are flat at rest. Any shadow is a reaction to
hover or focus, soft and low, and disappears when the interaction ends.

## 6. Do's and Don'ts

### Do:

- **Do** keep value-green to ≤10% of any screen — money, primary actions, active
  persona, nothing else.
- **Do** put the trust signals (verified date, eligibility, caveats) on the card and
  detail page where a builder can see them before clicking.
- **Do** use tabular figures for all dollar values so columns align and compare.
- **Do** draw structure with 1px hairlines and faint tonal surfaces, not shadows.
- **Do** keep body text ≥ 4.5:1 on Paper; push secondary metadata toward ink, never
  toward light gray.
- **Do** pair every status/region/audience color with text or an icon.

### Don't:

- **Don't** ship **generic SaaS-cream AI slop**: no cream/sand/beige body field, no
  gradient text, no identical icon-card grids, no hero-metric template, no tiny
  uppercase tracked eyebrows.
- **Don't** look like a **plain markdown awesome-list**: no unstyled wall of links,
  no flat undifferentiated rows. Hierarchy and scannability are the point.
- **Don't** look like a **cluttered coupon/deals site**: no ad-dense banners, no
  spammy badges, no countdown-timer urgency. We have no ads and no affiliate links.
- **Don't** look like **stiff corporate enterprise**: no navy-and-gray B2B template,
  no stock-photo corporate, no soulless density.
- **Don't** introduce a second display font that competes with the sans. One family,
  weight-driven hierarchy.
- **Don't** use shadows for decoration or color as the sole carrier of meaning.
