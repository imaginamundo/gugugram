import { imageModalStore } from "@stores/imagePostModalStore.svelte";

type Post = NonNullable<typeof imageModalStore.post>;

/** JSON payload emitted once per grid by `ImagePostList.astro`. */
const PAYLOAD_SELECTOR = "script[data-image-post-payload]";
/** Every grid link carries the id of the post it points at. */
const LINK_SELECTOR = "a[data-post-id]";

type SerializedPost = Omit<Post, "createdAt"> & { createdAt: string };

function readPosts(root: ParentNode): Map<string, Post> {
	const posts = new Map<string, Post>();

	for (const node of root.querySelectorAll(PAYLOAD_SELECTOR)) {
		if (!node.textContent) continue;

		try {
			for (const post of JSON.parse(node.textContent) as SerializedPost[]) {
				// JSON has no date type, but the modal formats `createdAt` through
				// `Intl.DateTimeFormat`, which throws on a string.
				posts.set(post.id, { ...post, createdAt: new Date(post.createdAt) });
			}
		} catch {
			// A malformed payload is not worth breaking the page over — the links
			// keep working, they just navigate instead of opening the modal.
		}
	}

	return posts;
}

/**
 * Opens the image modal from anywhere in the post grid with a single listener.
 *
 * The grid itself is server-rendered static markup: the posts used to be one
 * Svelte island each (up to 120 on the homepage), which meant 120 hydration
 * roots and 120 copies of the serialized post just to run `store.post = post`.
 * Now the whole grid ships as plain anchors plus one JSON payload, and this
 * listener resolves the clicked link back to its post.
 *
 * Returns a teardown function.
 */
export function delegateImagePostClicks(root: ParentNode & EventTarget = document) {
	let posts: Map<string, Post> | undefined;

	function handleClick(event: Event) {
		const { button, metaKey, ctrlKey, shiftKey, altKey } = event as MouseEvent;
		// Leave "open in a new tab/window" gestures to the browser.
		if (button !== 0 || metaKey || ctrlKey || shiftKey || altKey) return;

		const target = event.target;
		if (!(target instanceof Element)) return;

		const link = target.closest(LINK_SELECTOR);
		const id = link?.getAttribute("data-post-id");
		if (!id) return;

		// Parsed on first use so the payload is never read on pages without a grid.
		posts ??= readPosts(root);

		const post = posts.get(id);
		if (!post) return;

		event.preventDefault();
		imageModalStore.post = post;
	}

	root.addEventListener("click", handleClick);

	return () => root.removeEventListener("click", handleClick);
}
