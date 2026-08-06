/// <reference types="vitest/config" />
import { getViteConfig } from "astro/config";
import { svelteTesting } from "@testing-library/svelte/vite";

export default getViteConfig({
	plugins: [svelteTesting()],
	resolve: {
		conditions: ["browser"],
		alias: {
			// Astro virtual modules — stubbed for the test environment
			"astro:actions": new URL("./src/__tests__/__mocks__/astro-actions.ts", import.meta.url)
				.pathname,
			"astro:env/server": new URL("./src/__tests__/__mocks__/astro-env-server.ts", import.meta.url)
				.pathname,
			"astro:env/client": new URL("./src/__tests__/__mocks__/astro-env-client.ts", import.meta.url)
				.pathname,
			"astro:middleware": new URL("./src/__tests__/__mocks__/astro-middleware.ts", import.meta.url)
				.pathname,
			"astro/zod": new URL("./src/__tests__/__mocks__/astro-zod.ts", import.meta.url).pathname,
		},
	},
	test: {
		environment: "node",
		setupFiles: ["vitest.setup.ts"],
	},
});
