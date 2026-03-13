import { vitePreprocess } from "@astrojs/svelte";

export default {
	preprocess: vitePreprocess(),
	vitePlugin: {
		inspector: true,
	},
};
