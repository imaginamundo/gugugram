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
		files: ["src/**"],
		plugins: { boundaries },
		settings: {
			"import/resolver": {
				node: {
					extensions: [".ts", ".tsx", ".js", ".mjs", ".cjs", ".svelte", ".astro"],
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
			],
			"boundaries/pathsOverrides": {
				"@ui/*": ["./src/components/_ui/$1"],
				"@layout/*": ["./src/components/_layout/$1"],
				"@components/*": ["./src/components/$1"],
				"@infra/*": ["./src/infra/$1"],
				"@observability/*": ["./src/observability/$1"],
				"@auth": ["./src/auth.ts"],
				"@email/*": ["./src/email/$1"],
				"@schemas/*": ["./src/schemas/$1"],
				"@repositories/*": ["./src/repositories/$1"],
				"@services/*": ["./src/services/$1"],
				"@stores/*": ["./src/stores/$1"],
				"@utils/*": ["./src/utils/$1"],
				"@assets/*": ["./src/assets/$1"],
				"@icons/*": ["./src/assets/icons/$1"],
				"@customTypes/*": ["./src/types/$1"],
			},
		},
	},
	{
		files: ["src/**"],
		plugins: { boundaries },
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
		},
	},
	{
		files: ["src/__tests__/**"],
		rules: {
			"boundaries/dependencies": "off",
			"boundaries/no-unknown": "off",
		},
	},
];
