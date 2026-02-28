// @ts-check
import { defineConfig } from "astro/config";
import svelte from "@astrojs/svelte";

import vercel from "@astrojs/vercel";

// https://astro.build/config
export default defineConfig({
	site: "https://www.gugugram.com",
	integrations: [svelte()],
	adapter: vercel(),
	output: "server",
	security: {
		checkOrigin: false,
	},
});
