// @ts-check
import { defineConfig } from "astro/config";
import svelte from "@astrojs/svelte";
import vercel from "@astrojs/vercel";
import { loadEnv } from "vite";

const { PUBLIC_BASE_URL } = loadEnv(process.env.NODE_ENV || "development", process.cwd(), "");

// https://astro.build/config
export default defineConfig({
	site: PUBLIC_BASE_URL,
	integrations: [svelte()],
	adapter: vercel(),
	output: "server",
	security: {
		checkOrigin: false,
	},
});
