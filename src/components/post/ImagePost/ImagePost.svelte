<script lang="ts">
	// Presentational only: rendered on the server with no `client:*` directive,
	// so it ships no JavaScript of its own. Opening the modal is handled by the
	// single delegated listener in `delegateImagePostClicks`, which resolves
	// `data-post-id` against the payload `ImagePostList.astro` emits.
	import type { PostType } from "@services/imagePost";

	const { post, index }: { post: PostType; index?: number } = $props();

	const accessibleName = $derived(post.description ? post.description : `Foto de ${post.username}`);

	// The first screenful of the grid loads eagerly so the LCP image is not
	// deferred. `index` is 0-based, so it must be compared against `undefined`
	// rather than tested for truthiness — `!!0` is `false` and would lazy-load
	// the very first image.
	const isAboveTheFold = $derived(index !== undefined && index < 20);
</script>

<a
	href={`/${post.username}/${post.id}`}
	aria-haspopup="dialog"
	data-post-id={post.id}
	class="button button-image"
>
	{#if post.commentsCount > 0}
		<span class="image-comment-counter p">{post.commentsCount}</span>
	{/if}
	<img
		class="image-border"
		src={post.image}
		width="120"
		height="120"
		alt={accessibleName}
		loading={isAboveTheFold ? "eager" : "lazy"}
		fetchpriority={isAboveTheFold ? "high" : "auto"}
	/>
</a>
