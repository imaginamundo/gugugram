<script lang="ts">
  import ImagePost from "@components/ImagePost/ImagePost.svelte";
  import type { PostType } from "@services/image";

  const {posts}: { posts: PostType[] } = $props();
</script>

<div class="flex justify-center flex-wrap">
  {#each posts as post}
    <ImagePost {post} />
  {/each}
  {#if posts.length === 0}
    <p>Ainda sem nenhuma imagem :(</p>
  {/if}
</div>

