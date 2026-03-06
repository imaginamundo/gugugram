<script lang="ts">
	import { formatDate } from "@utils/date";
	import type { PostType, CommentType } from "@services/image";
	import Button from "@components/_ui/Button.svelte";
	import ImagePostComments from "@components/ImagePostComments/ImagePostComments.svelte";

	const {
		post,
		session,
	}: { post: PostType & { comments?: CommentType[] }; session: App.Locals["user"] } = $props();

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

<div class="flex flex-wrap gap mb">
	<figure class="post-figure">
		<img
			src={post.image}
			alt={`Imagem por ${post.username}`}
			class="w-full image-border"
			fetchpriority="high"
			loading="eager"
		/>
		<figcaption class="mt mb">
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
				Escreveu:
				<p class="mt p description-content">{post.description}</p>
			{/if}
		</figcaption>
	</figure>
	<div class="post-comments-wrapper">
		<ImagePostComments
			comments={post.comments}
			postId={post.id}
			postAuthorId={post.userId}
			{session}
		/>
	</div>
</div>

<style>
	.post-figure {
		flex-grow: 1;
		flex-shrink: 1;
		flex-basis: 380px;
	}
	.description-content {
		overflow-wrap: break-word;
		border: 1px dashed black;
	}
	.post-comments-wrapper {
		display: flex;
		flex-direction: column;
		flex-grow: 999;
		flex-shrink: 1;
		flex-basis: 380px;
		min-width: 0;
		min-height: 0;
	}
</style>
