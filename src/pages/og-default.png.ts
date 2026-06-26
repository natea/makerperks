import type { APIRoute } from "astro";
import { renderDefaultOg } from "../lib/ogImage";

/**
 * /og-default.png — the branded default share image (homepage, persona pages, and
 * any page without a specific image). Generated at build time.
 */
export const GET: APIRoute = async () => {
  const png = await renderDefaultOg();
  return new Response(new Blob([png], { type: "image/png" }), {
    headers: { "cache-control": "public, max-age=31536000, immutable" },
  });
};
