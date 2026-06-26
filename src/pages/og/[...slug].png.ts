import type { APIRoute } from "astro";
import {
  getPublishedPrograms,
  displayValue,
  type Program,
} from "../../lib/programs";
import { renderProgramOg } from "../../lib/ogImage";

/**
 * /og/<provider>/<slug>.png — per-program share image, generated at build time
 * (one static asset per published program; no runtime generation).
 */
export async function getStaticPaths() {
  const programs = await getPublishedPrograms();
  return programs.map((program) => ({
    params: { slug: program.id },
    props: { program },
  }));
}

export const GET: APIRoute = async ({ props }) => {
  const { program } = props as { program: Program };
  const png = await renderProgramOg({
    title: program.data.title,
    provider: program.data.provider_slug,
    value: displayValue(program.data),
  });
  return new Response(new Blob([png], { type: "image/png" }), {
    headers: { "cache-control": "public, max-age=31536000, immutable" },
  });
};
