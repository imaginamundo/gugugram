// @ts-check
import { defineConfig } from "astro/config";
import svelte from "@astrojs/svelte";
import vercel from "@astrojs/vercel";
import sentry from "@sentry/astro";
import { loadEnv } from "vite";

const { PUBLIC_BASE_URL, SENTRY_AUTH_TOKEN } = loadEnv(
	process.env.NODE_ENV || "development",
	process.cwd(),
	"",
);

// https://astro.build/config
export default defineConfig({
	site: PUBLIC_BASE_URL,
	integrations: [
		svelte(),
		sentry({
			org: "gugugram",
			project: "elo7",
			// store your auth token in an environment variable
			authToken: SENTRY_AUTH_TOKEN,
		}),
	],
	adapter: vercel(),
	output: "server",
	security: {
		checkOrigin: false,
	},
});
