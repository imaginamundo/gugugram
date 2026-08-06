/// <reference types="vitest/config" />
import { fileURLToPath } from "node:url";
import { getViteConfig } from "astro/config";
import { svelteTesting } from "@testing-library/svelte/vite";

export default getViteConfig({
	plugins: [svelteTesting()],
	resolve: {
		conditions: ["browser"],
		alias: {
			// Astro virtual modules — stubbed for the test environment
			"astro:actions": fileURLToPath(
				new URL("./src/__tests__/__mocks__/astro-actions.ts", import.meta.url),
			),
			"astro:env/server": fileURLToPath(
				new URL("./src/__tests__/__mocks__/astro-env-server.ts", import.meta.url),
			),
			"astro:env/client": fileURLToPath(
				new URL("./src/__tests__/__mocks__/astro-env-client.ts", import.meta.url),
			),
			"astro:middleware": fileURLToPath(
				new URL("./src/__tests__/__mocks__/astro-middleware.ts", import.meta.url),
			),
			"astro/zod": fileURLToPath(new URL("./src/__tests__/__mocks__/astro-zod.ts", import.meta.url)),
		},
	},
	test: {
		environment: "node",
		setupFiles: ["vitest.setup.ts"],
	},
});
