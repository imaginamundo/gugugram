<script lang="ts">
	import { formatDate } from "@utils/date";
	import type { PostType } from "@services/image";

	const {
		post,
	}: { post: PostType; } = $props();
</script>

<figure>
  <img
    src={post.image}
    alt={`Imagem por ${post.username}`}
    class="w-full image-border"
    fetchpriority="high"
    loading="eager"
  />
  <figcaption class="description mt mb">
    ({formatDate(post.createdAt)})
    <a href={`/${post.username}`}>{post.username}</a>
    {#if post.description}
      escreveu:
      <p class="field-border mt p description-content">{post.description}</p>
    {/if}
  </figcaption>
</figure>

<style>
	.description {
		text-align: left;
	}
	.description-content {
		background: #fff;
		overflow-wrap: break-word;
	}
</style>
