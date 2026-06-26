import type { Program } from "./programs";
import { displayValue } from "./programs";

/**
 * schema.org JSON-LD for a program detail page. Embed the returned object in the
 * page <head> as <script type="application/ld+json">. Wired into the program
 * detail template (built via Impeccable).
 */
export function programJsonLd(p: Program, siteUrl: string) {
  const d = p.data;
  const offer: Record<string, unknown> = {
    "@type": "Offer",
    name: d.title,
    description: d.intro,
    url: d.url,
    category: d.tags?.join(", ") || "builder perks",
    seller: {
      "@type": "Organization",
      name: d.provider_slug,
    },
    eligibleCustomerType: d.audience,
    availability:
      d.status === "Discontinued"
        ? "https://schema.org/Discontinued"
        : "https://schema.org/InStock",
  };
  if (d.value_type !== "discount" && d.max_value) {
    offer.priceSpecification = {
      "@type": "PriceSpecification",
      maxPrice: d.max_value,
      priceCurrency: d.currency ?? "USD",
      valueAddedTaxIncluded: false,
    };
  }
  return {
    "@context": "https://schema.org",
    ...offer,
    additionalProperty: {
      "@type": "PropertyValue",
      name: "value",
      value: displayValue(d),
    },
    isAccessibleForFree: true,
    sameAs: siteUrl,
  };
}
