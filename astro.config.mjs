// @ts-check
import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
import wix from "@wix/astro-internal";

// https://astro.build/config
export default defineConfig({
  output: "server",
  integrations: [wix(), tailwind(), react()],
  image: {
    domains: ["static.wixstatic.com"],
  },
  vite: {
    ssr: {
      noExternal: [
        "@wix/builder-wix-components",
        "@wix/editor-elements-public"
      ],
    },
  },
});
