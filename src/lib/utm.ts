/**
 * Append MakerPerks UTM attribution to an outbound provider URL.
 *
 * This is **attribution, not an affiliate link**: it adds `utm_*` query params so a
 * provider's own analytics can credit MakerPerks as the referral source. The
 * destination is unchanged — no redirect, no commission, it still resolves to the
 * provider's official page.
 *
 * Existing query params are preserved and never clobbered: any key already present on
 * the URL (including a `utm_*` the provider URL already carries) is left untouched; we
 * only add the keys that are missing. Non-parseable URLs (e.g. `mailto:`, relative) are
 * returned unchanged.
 */
export function withUtm(
  url: string,
  opts: { campaign: string; content?: string },
): string {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return url;
  }

  // Only http(s) destinations carry meaningful UTM query params; leave mailto:, tel:,
  // and anything else untouched.
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return url;
  }

  const addIfAbsent = (key: string, value: string | undefined) => {
    if (value && !parsed.searchParams.has(key)) {
      parsed.searchParams.set(key, value);
    }
  };

  addIfAbsent("utm_source", "makerperks");
  addIfAbsent("utm_medium", "referral");
  addIfAbsent("utm_campaign", opts.campaign);
  addIfAbsent("utm_content", opts.content);

  return parsed.toString();
}
