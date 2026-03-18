import type { PostType } from "@services/imagePost";

let post = $state<PostType | undefined>();

export const imageModalStore = {
	get post() {
		return post;
	},
	set post(value) {
		post = value;
	},
	clear() {
		post = undefined;
	},
};
