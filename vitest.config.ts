import { defineConfig } from "vitest/config";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { svelteTesting } from "@testing-library/svelte/vite";

export default defineConfig({
	plugins: [svelte(), svelteTesting()],
	test: {
		environment: "node",
		setupFiles: ["src/__tests__/setup.ts"],
	},
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
			"@ui": new URL("./src/components/_ui", import.meta.url).pathname,
			"@layout": new URL("./src/components/_layout", import.meta.url).pathname,
			"@icons": new URL("./src/assets/icons", import.meta.url).pathname,
			"@lib": new URL("./src/lib", import.meta.url).pathname,
			"@customTypes": new URL("./src/types", import.meta.url).pathname,
			"@assets": new URL("./src/assets", import.meta.url).pathname,
			"@schemas": new URL("./src/schemas", import.meta.url).pathname,
			"@database": new URL("./src/database", import.meta.url).pathname,
			"@repositories": new URL("./src/repositories", import.meta.url).pathname,
			"@services": new URL("./src/services", import.meta.url).pathname,
			"@features": new URL("./src/features", import.meta.url).pathname,
			"@styles": new URL("./src/styles", import.meta.url).pathname,
			"@utils": new URL("./src/utils", import.meta.url).pathname,
			"@stores": new URL("./src/stores", import.meta.url).pathname,
			"@components": new URL("./src/components", import.meta.url).pathname,
			"src/utils": new URL("./src/utils", import.meta.url).pathname,
		},
	},
});
