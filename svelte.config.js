import { vitePreprocess } from "@astrojs/svelte";

export default {
	site: "https://gugugram.com",
	base: "/",
	preprocess: vitePreprocess(),
	vitePlugin: {
		inspector: true
	}
};
