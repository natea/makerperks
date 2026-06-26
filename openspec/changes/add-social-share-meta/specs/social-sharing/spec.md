# Social Sharing

## ADDED Requirements

### Requirement: Rich link-preview metadata

Every HTML page SHALL emit Open Graph and Twitter Card metadata sufficient for a rich
preview: title, description, canonical page URL, site name, an image, and a
`summary_large_image` Twitter card. The page URL and image URL SHALL be absolute.

#### Scenario: Open Graph tags present

- **WHEN** any page renders
- **THEN** its `<head>` includes `og:title`, `og:description`, `og:url`,
  `og:image`, `og:type`, and `og:site_name`
- **AND** `og:url` and `og:image` are absolute URLs

#### Scenario: Twitter card present

- **WHEN** any page renders
- **THEN** its `<head>` includes `twitter:card` = `summary_large_image` with
  matching `twitter:title`, `twitter:description`, and `twitter:image`

### Requirement: Per-program share image

A program (provider/perk) detail page SHALL reference a build-time-generated share
image that identifies the specific program — the provider's logo, the program title,
and its headline value/discount — rendered on the brand. A program whose provider has
no logo SHALL fall back to a neutral monogram, never a broken image.

#### Scenario: Program page previews the specific perk

- **WHEN** a program detail page is shared
- **THEN** its `og:image` / `twitter:image` is that program's generated image showing
  the provider logo, title, and value

#### Scenario: Image generated at build

- **WHEN** the site is built
- **THEN** each published program's share image exists as a static asset in the
  output (no runtime generation)

### Requirement: Branded default image

The homepage and persona pages SHALL use a branded default share image, and any page
without a specific image SHALL fall back to it.

#### Scenario: Homepage uses the default

- **WHEN** the homepage or a persona page is shared
- **THEN** its `og:image` is the branded default image
