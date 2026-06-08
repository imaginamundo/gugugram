import globals from "globals";
import eslintPluginAstro from "eslint-plugin-astro";
import eslintPluginSvelte from "eslint-plugin-svelte";
import eslintConfigPrettier from "eslint-config-prettier";
import tseslint from "typescript-eslint";
import svelteConfig from "./svelte.config.js";
import boundaries from "eslint-plugin-boundaries";

export default [
	{
		ignores: ["drizzle/", "dist/", ".astro/", "node_modules/"],
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
				{ type: "auth", pattern: "src/auth.ts" },
				{ type: "email", pattern: "src/email/**" },
				{ type: "schemas", pattern: "src/schemas/**" },
				{ type: "types", pattern: "src/types/**" },
				{ type: "utils", pattern: "src/utils/**" },
				{ type: "assets", pattern: "src/assets/**" },
				{ type: "middleware", pattern: "src/middleware/**" },
				{ type: "styles", pattern: "src/styles/**" },
			],
		},
		rules: {
			"boundaries/dependencies": [
				"error",
				{
					default: "disallow",
					rules: [
						{
							from: { type: "repositories" },
							allow: [
								{ to: { type: "infra" } },
								{ to: { type: "schemas" } },
								{ to: { type: "types" } },
								{ to: { type: "utils" } },
							],
						},
						{
							from: { type: "services" },
							allow: [
								{ to: { type: "repositories" } },
								{ to: { type: "infra" } },
								{ to: { type: "schemas" } },
								{ to: { type: "types" } },
								{ to: { type: "utils" } },
							],
						},
						{
							from: { type: "actions" },
							allow: [
								{ to: { type: "services" } },
								{ to: { type: "observability" } },
								{ to: { type: "schemas" } },
								{ to: { type: "types" } },
								{ to: { type: "utils" } },
							],
						},
						{
							from: { type: "components" },
							allow: [
								{ to: { type: "components" } },
								{ to: { type: "stores" } },
								{ to: { type: "utils" } },
								{ to: { type: "types" } },
								{ to: { type: "schemas" } },
								{ to: { type: "assets" } },
								{ to: { type: "styles" } },
							],
						},
						{
							from: { type: "pages" },
							allow: [
								{ to: { type: "services" } },
								{ to: { type: "components" } },
								{ to: { type: "auth" } },
								{ to: { type: "observability" } },
								{ to: { type: "schemas" } },
								{ to: { type: "types" } },
								{ to: { type: "utils" } },
								{ to: { type: "stores" } },
								{ to: { type: "styles" } },
							],
						},
						{
							from: { type: "stores" },
							allow: [
								{ to: { type: "utils" } },
								{ to: { type: "types" } },
								{ to: { type: "schemas" } },
							],
						},
						{
							from: { type: "infra" },
							allow: [
								{ to: { type: "schemas" } },
								{ to: { type: "types" } },
								{ to: { type: "utils" } },
							],
						},
						{
							from: { type: "observability" },
							allow: [{ to: { type: "types" } }, { to: { type: "utils" } }],
						},
						{
							from: { type: "auth" },
							allow: [
								{ to: { type: "infra" } },
								{ to: { type: "email" } },
								{ to: { type: "schemas" } },
								{ to: { type: "types" } },
								{ to: { type: "utils" } },
							],
						},
						{
							from: { type: "email" },
							allow: [{ to: { type: "types" } }, { to: { type: "utils" } }],
						},
						{
							from: { type: "middleware" },
							allow: [
								{ to: { type: "middleware" } },
								{ to: { type: "auth" } },
								{ to: { type: "types" } },
								{ to: { type: "utils" } },
							],
						},
						{ from: { type: "schemas" }, allow: [{ to: { type: "types" } }] },
						{ from: { type: "utils" }, allow: [{ to: { type: "types" } }] },
					],
				},
			],
			"boundaries/no-unknown": "error",
			"boundaries/no-unknown-files": "error",
		},
	},
	{
		files: ["src/__tests__/**"],
		rules: {
			"boundaries/dependencies": "off",
			"boundaries/no-unknown": "off",
			"boundaries/no-unknown-files": "off",
		},
	},
	{
		files: ["**/*.css"],
		rules: {
			"boundaries/no-unknown": "off",
			"boundaries/no-unknown-files": "off",
			"boundaries/no-unknown-files": "off",
		},
	},
];
