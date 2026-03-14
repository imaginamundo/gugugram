import type { PostType } from "@services/imagePost";

class ImageModalStore {
	#post = $state<PostType>();

	get post() {
		return this.#post;
	}

	set post(post) {
		this.#post = post;
	}

	clear() {
		this.#post = undefined;
	}
}

export const imageModalStore = new ImageModalStore();
