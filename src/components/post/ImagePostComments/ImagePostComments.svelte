<script lang="ts">
	import { onMount } from "svelte";
	import { actions } from "astro:actions";
	import { formatDate } from "@utils/date";
	import Button from "@ui/Button.svelte";
	import Input from "@ui/Input.svelte";
	import type { CommentType, CommentsPageType } from "@services/imagePost";

	const {
		comments,
		postId,
		postAuthorId,
		session,
	}: {
		comments?: CommentType[];
		postId: string;
		postAuthorId: string;
		session?: App.Locals["user"];
	} = $props();

	let fetchedComments = $state<CommentType[]>([]);
	let fetchedPage = $state(0);
	let fetchedTotalPages = $state(1);
	let fetchedTotalCount = $state(0);
	let hasFetched = $state(false);
	let isLoadingMore = $state(false);
	let isLoading = $derived(comments === undefined && !hasFetched);
	let displayComments = $derived(comments !== undefined ? comments : fetchedComments);
	// The fetched list is one page of a larger set, so the header count comes
	// from the server total rather than from what is currently rendered.
	let totalComments = $derived(comments !== undefined ? comments.length : fetchedTotalCount);
	let hasMore = $derived(comments === undefined && hasFetched && fetchedPage < fetchedTotalPages);

	const sessionId = $derived(session?.id);

	async function loadPage(page: number) {
		const res = await fetch(`/api/post/${postId}/comments?page=${page}`);
		if (!res.ok) throw new Error("Erro ao buscar comentários");

		const data: CommentsPageType = await res.json();

		fetchedComments = page === 1 ? data.items : [...fetchedComments, ...data.items];
		fetchedPage = data.pagination.page;
		fetchedTotalPages = data.pagination.totalPages;
		fetchedTotalCount = data.pagination.totalCount;
	}

	async function loadMore() {
		if (isLoadingMore) return;
		isLoadingMore = true;
		try {
			await loadPage(fetchedPage + 1);
		} catch (err) {
			console.error(err);
		} finally {
			isLoadingMore = false;
		}
	}

	onMount(() => {
		if (comments !== undefined) return;

		loadPage(1)
			.catch((err) => {
				console.error(err);
			})
			.finally(() => {
				hasFetched = true;
			});
	});
</script>

<div class="mb">
	<p>
		<strong>
			{#if isLoading}
				Comentários (...)
			{:else}
				Comentários ({totalComments})
			{/if}
		</strong>
	</p>
</div>
{#if session}
	<form method="POST" action={actions.sendImagePostComment} class="flex justify-stretch gap mb">
		<input type="hidden" name="imageId" value={postId} />

		<Input
			name="body"
			placeholder="Escreva um comentário..."
			class="w-full"
			required
			maxlength={500}
		/>

		<Button type="submit">Comentar</Button>
	</form>
{:else}
	<p class="mb text-muted">Você precisa estar conectado para comentar.</p>
{/if}

{#if isLoading}
	<p class="text-muted mb p field-border" style="background: #fff;">Carregando comentários...</p>
{:else if displayComments.length === 0}
	<p class="text-muted mb p field-border" style="background: #fff;">
		Nenhum comentário ainda. Seja o primeiro a comentar!
	</p>
{:else}
	<div class="comments-list flex flex-col gap field-border p">
		{#each displayComments as comment (comment.id)}
			<div class="flex center gap mb-sm">
				{#if sessionId && (sessionId === comment.authorId || sessionId === postAuthorId)}
					<form method="POST" action={actions.deleteImagePostComment}>
						<input type="hidden" name="commentId" value={comment.id} />
						<Button type="submit" aria-label={`Apagar comentário de ${comment.authorUsername}`}>
							Apagar
						</Button>
					</form>
				{/if}

				<p>
					<span class="text-muted">
						(<time datetime={new Date(comment.createdAt).toISOString()}
							>{formatDate(new Date(comment.createdAt))}</time
						>)
					</span>
					<a href={`/${comment.authorUsername}`}>{comment.authorUsername}</a> disse: {comment.body}
				</p>
			</div>
		{/each}
	</div>

	{#if hasMore}
		<Button type="button" class="mt" onclick={loadMore} disabled={isLoadingMore}>
			{isLoadingMore ? "Carregando..." : "Carregar mais comentários"}
		</Button>
	{/if}
{/if}

<style>
	.comments-list {
		background-color: #fff;
		overflow-y: auto;
		min-height: 0;
		max-height: 200px;
	}
</style>
