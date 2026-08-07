<script lang="ts">
	// Presentational only: rendered on the server with no `client:*` directive,
	// so it ships no JavaScript of its own. Opening the modal is handled by the
	// single delegated listener in `delegateImagePostClicks`, which resolves
	// `data-post-id` against the payload `ImagePostList.astro` emits.
	import type { PostType } from "@services/imagePost";

	const { post, index }: { post: PostType; index?: number } = $props();

	const accessibleName = $derived(post.description ? post.description : `Foto de ${post.username}`);
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
		loading={!!index && index < 20 ? "eager" : "lazy"}
		fetchpriority={!!index && index < 20 ? "high" : "auto"}
	/>
</a>
