import globals from "globals";
import eslintPluginAstro from "eslint-plugin-astro";
import eslintPluginSvelte from "eslint-plugin-svelte";
import eslintConfigPrettier from "eslint-config-prettier";
import tseslint from "typescript-eslint";
import svelteConfig from "./svelte.config.js";
import boundaries from "eslint-plugin-boundaries";

export default [
	{
		ignores: [
			"drizzle/",
			"dist/",
			".astro/",
			"node_modules/",
			".vercel",
			".git",
			"src/env.d.ts",
			"src/styles/**",
		],
	},
	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node,
			},
		},
	},
	...tseslint.configs.recommended,
	...eslintPluginAstro.configs.recommended,
	...eslintPluginAstro.configs["jsx-a11y-recommended"],
	...eslintPluginSvelte.configs["flat/recommended"],
	{
		files: ["**/*.svelte", "**/*.svelte.ts"],
		languageOptions: {
			parserOptions: {
				parser: tseslint.parser,
				svelteConfig,
			},
		},
	},
	eslintConfigPrettier,
	{
		files: ["src/**/*.{js,ts,svelte,astro}"],
		plugins: { boundaries },
		settings: {
			"import/resolver": {
				typescript: {
					alwaysTryTypes: true,
					project: "./tsconfig.json",
				},
			},
			"boundaries/elements": [
				{ type: "actions", pattern: "src/actions/**" },
				{ type: "services", pattern: "src/services/**" },
				{ type: "repositories", pattern: "src/repositories/**" },
				{ type: "components", pattern: "src/components/**" },
				{ type: "pages", pattern: "src/pages/**" },
				{ type: "stores", pattern: "src/stores/**" },
				{ type: "infra", pattern: "src/infra/**" },
				{ type: "observability", pattern: "src/observability/**" },
				{ type: "email", pattern: "src/email/**" },
				{ type: "schemas", pattern: "src/schemas/**" },
				{ type: "types", pattern: "src/types/**" },
				{ type: "utils", pattern: "src/utils/**" },
				{ type: "assets", pattern: "src/assets/**" },
				{ type: "middleware", pattern: "src/middleware/**" },
				{ type: "styles", pattern: "src/styles/**" },
			],
			"boundaries/files": [{ category: "auth", pattern: "src/auth.ts" }],
		},
		rules: {
			"boundaries/dependencies": [
				"error",
				{
					default: "disallow",
					policies: [
						{
							from: { element: { types: "repositories" } },
							allow: [{ to: { element: { types: ["infra", "schemas", "types", "utils"] } } }],
						},
						{
							from: { element: { types: "services" } },
							allow: [
								{
									to: {
										element: {
											types: ["repositories", "infra", "schemas", "types", "utils"],
										},
									},
								},
								{ to: { file: { categories: "auth" } } },
							],
						},
						{
							from: { element: { types: "actions" } },
							allow: [
								{
									to: {
										element: {
											types: ["actions", "services", "observability", "schemas", "types", "utils"],
										},
									},
								},
								{ to: { file: { categories: "auth" } } },
							],
						},
						{
							from: { element: { types: "components" } },
							allow: [
								{
									to: {
										element: {
											types: [
												"components",
												"stores",
												"services",
												"utils",
												"types",
												"schemas",
												"assets",
												"styles",
											],
										},
									},
								},
							],
						},
						{
							from: { element: { types: "pages" } },
							allow: [
								{
									to: {
										element: {
											types: [
												"services",
												"components",
												"observability",
												"schemas",
												"types",
												"utils",
												"stores",
												"styles",
											],
										},
									},
								},
								{ to: { file: { categories: "auth" } } },
							],
						},
						{
							from: { element: { types: "stores" } },
							allow: [{ to: { element: { types: ["utils", "types", "schemas", "services"] } } }],
						},
						{
							from: { element: { types: "infra" } },
							allow: [{ to: { element: { types: ["schemas", "types", "utils"] } } }],
						},
						{
							from: { element: { types: "observability" } },
							allow: [{ to: { element: { types: ["types", "utils"] } } }],
						},
						{
							from: { file: { categories: "auth" } },
							allow: [
								{
									to: {
										element: {
											types: ["infra", "email", "schemas", "types", "utils"],
										},
									},
								},
							],
						},
						{
							from: { element: { types: "email" } },
							allow: [{ to: { element: { types: ["types", "utils"] } } }],
						},
						{
							from: { element: { types: "middleware" } },
							allow: [
								{ to: { element: { types: ["middleware", "types", "utils"] } } },
								{ to: { file: { categories: "auth" } } },
							],
						},
						{
							from: { element: { types: "schemas" } },
							allow: [{ to: { element: { types: ["types"] } } }],
						},
						{
							from: { element: { types: "utils" } },
							allow: [{ to: { element: { types: ["types"] } } }],
						},
					],
				},
			],
			"boundaries/no-unknown-dependencies": "error",
			"boundaries/no-unknown-files": "error",
		},
	},
	{
		files: ["src/__tests__/**"],
		rules: {
			"boundaries/dependencies": "off",
			"boundaries/no-unknown-dependencies": "off",
			"boundaries/no-unknown-files": "off",
		},
	},
	{
		files: ["**/*.css"],
		rules: {
			"boundaries/no-unknown-dependencies": "off",
			"boundaries/no-unknown-files": "off",
		},
	},
];
