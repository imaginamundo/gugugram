// @ts-check
import { defineConfig } from "astro/config";
import svelte from "@astrojs/svelte";

import vercel from "@astrojs/vercel";

import sentry from "@sentry/astro";

// https://astro.build/config
export default defineConfig({
	site: process.env.PUBLIC_BASE_URL,
	integrations: [
		svelte(),
		sentry({
			org: "gugugram",
			project: "elo7",
			// store your auth token in an environment variable
			authToken: process.env.SENTRY_AUTH_TOKEN,
		}),
	],
	adapter: vercel(),
	output: "server",
	security: {
		checkOrigin: false,
	},
});
