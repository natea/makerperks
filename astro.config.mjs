// @ts-check
import { defineConfig } from "astro/config";

import sitemap from "@astrojs/sitemap";

// https://astro.build
export default defineConfig({
  site: "https://www.makerperks.com",
  trailingSlash: "ignore",

  build: {
    format: "directory",
  },

  integrations: [sitemap()],
});
