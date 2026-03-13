<script lang="ts">
	import { imageModalStore as store } from "@stores/imageModalStore.svelte";
	import type { PostType } from "@services/image";

	const { post, index }: { post: PostType; index?: number } = $props();

	function handleOpenPostDetails(e: Event) {
		e.preventDefault();
		store.post = post;
	}

	const accessibleName = $derived(
    post.description ? post.description : `Foto de ${post.username}`
  );
</script>

<a
	href={`/${post.username}/${post.id}`}
	aria-haspopup="dialog"
	onclick={handleOpenPostDetails}
	class="button button-image"
>
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
