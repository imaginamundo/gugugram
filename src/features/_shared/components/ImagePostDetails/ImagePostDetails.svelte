<script lang="ts">
	import { formatDate } from "@utils/date";
	import type { PostType } from "@services/image";
	import Button from "@components/_ui/Button.svelte";

	const { post }: { post: PostType } = $props();

	let copied = $state(false);

	async function handleShare() {
		const url = `${window.location.origin}/${post.username}/${post.id}`;

		try {
			if (navigator.share) {
				await navigator.share({
					title: `Imagem de ${post.username} no Gugugram`,
					text: post.description || `Veja esta foto de ${post.username}!`,
					url: url,
				});
			} else {
				await navigator.clipboard.writeText(url);

				copied = true;
				setTimeout(() => {
					copied = false;
				}, 2000);
			}
		} catch (error) {
			console.error("Erro ao compartilhar:", error);
		}
	}
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
		<div class="flex justify-between center mb-sm">
			<span>
				({formatDate(post.createdAt)})
				<a href={`/${post.username}`}>{post.username}</a>
			</span>

			<Button onclick={handleShare}>
				<img
					src="/icons/entire_network_globe-4.png"
					width="16"
					height="16"
					alt=""
					aria-hidden="true"
				/>
				{copied ? "Link copiado!" : "Compartilhar"}
			</Button>
		</div>

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
