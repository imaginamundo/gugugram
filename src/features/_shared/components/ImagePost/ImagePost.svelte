<script lang="ts">
	import Button from "@components/_ui/Button.svelte";
	import { imageModalStore as store } from "@stores/imageModalStore.svelte";
	import type { PostType } from "@services/image";

	const { post, index }: { post: PostType; index?: number } = $props();
</script>

<Button onclick={() => (store.post = post)} class="button-image">
	<img
		class="image-border"
    src={post.image}
    width="120"
		height="120"
    alt={`Imagem por ${post.username}`}
    loading={ !!index && index < 20 ? "eager" : "lazy" }
    fetchpriority={ !!index && index < 20 ? "high" : "auto" }
	/>
</Button>
