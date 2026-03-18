// @ts-check
import { defineConfig, envField } from "astro/config";
import svelte from "@astrojs/svelte";
import vercel from "@astrojs/vercel";
import sentry from "@sentry/astro";
import { loadEnv } from "vite";

const env = loadEnv(process.env.NODE_ENV || "development", process.cwd(), "");

// https://astro.build/config
export default defineConfig({
	site: "http://www.gugugram.com",
	integrations: [
		svelte(),
		sentry({
			telemetry: false,
			sourceMapsUploadOptions: {
				project: env.SENTRY_PROJECT,
				authToken: env.SENTRY_AUTH_TOKEN,
				org: env.SENTRY_ORG,
			},
		}),
	],
	adapter: vercel(),
	output: "server",
	security: {
		checkOrigin: false,
	},
	env: {
		schema: {
			POSTGRES_URL: envField.string({
				context: "server",
				access: "secret",
				url: true,
				startsWith: "postgresql://",
			}),
			AUTH_SECRET: envField.string({ context: "server", access: "secret" }),

			UPLOADTHING_TOKEN: envField.string({ context: "server", access: "secret" }),

			MAILER_SERVICE: envField.string({ context: "server", access: "secret" }),
			MAILER_HOST: envField.string({ context: "server", access: "secret" }),
			MAILER_USER: envField.string({ context: "server", access: "secret" }),
			MAILER_PASSWORD: envField.string({ context: "server", access: "secret" }),

			POSTHOG_KEY: envField.string({ access: "public", context: "client" }),
			POSTHOG_HOST: envField.string({ access: "public", context: "server", url: true }),

			SENTRY_AUTH_TOKEN: envField.string({ access: "secret", context: "server" }),
			SENTRY_ORG: envField.string({ access: "secret", context: "server" }),
			SENTRY_PROJECT: envField.string({ access: "secret", context: "server" }),
			SENTRY_DSN: envField.string({ access: "public", context: "client", url: true }),
		},
	},
});
