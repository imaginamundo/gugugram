<script lang="ts">
	import Button from "@components/_ui/Button.svelte";
	import { imageModalStore as store } from "@stores/imageModalStore.svelte";
	import type { PostType } from "@services/image";

	const {post}: {post: PostType} = $props();
</script>

<Button onclick={() => (store.post = post)} class="p-0">
	<img
		class="image-border"
		src={post.image}
		alt={`Imagem por ${post.username}`}
		width="120"
		height="120"
	/>
</Button>
