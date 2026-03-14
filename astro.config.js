// @ts-check
import { defineConfig, envField } from "astro/config";
import svelte from "@astrojs/svelte";
import vercel from "@astrojs/vercel";

// https://astro.build/config
export default defineConfig({
	site: "http://www.gugugram.com",
	integrations: [svelte()],
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
		},
	},
});
