import globals from "globals";
import eslintPluginAstro from "eslint-plugin-astro";
import eslintPluginSvelte from "eslint-plugin-svelte";
import eslintConfigPrettier from "eslint-config-prettier";
import tseslint from "typescript-eslint";
import svelteConfig from "./svelte.config.js";

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
];
