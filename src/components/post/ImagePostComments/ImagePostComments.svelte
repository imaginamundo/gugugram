<script lang="ts">
	import { onMount } from "svelte";
	import { actions } from "astro:actions";
	import { formatDate } from "@utils/date";
	import Button from "@ui/Button.svelte";
	import Input from "@ui/Input.svelte";
	import { COMMENTS_PAGE_SIZE } from "@utils/pagination";
	import type { CommentType, CommentsPageType } from "@services/imagePost";

	const {
		comments,
		totalCount,
		postId,
		postAuthorId,
		session,
	}: {
		/** First page, server-rendered. Absent inside the modal, which fetches it. */
		comments?: CommentType[];
		/** Total across every page, so the header does not count only what is loaded. */
		totalCount?: number;
		postId: string;
		postAuthorId: string;
		session?: App.Locals["user"];
	} = $props();

	let fetchedComments = $state<CommentType[]>([]);
	let fetchedTotalCount = $state(0);
	let hasFetched = $state(false);
	let isLoadingMore = $state(false);
	let isLoading = $derived(comments === undefined && !hasFetched);
	// Server-rendered page 1 (when present) followed by whatever has been paged in.
	let displayComments = $derived(
		comments !== undefined ? [...comments, ...fetchedComments] : fetchedComments,
	);
	// The rendered list is one page of a larger set, so the header count comes
	// from the server total rather than from what is currently on screen.
	let totalComments = $derived(
		comments !== undefined ? (totalCount ?? comments.length) : fetchedTotalCount,
	);
	let hasMore = $derived(!isLoading && displayComments.length < totalComments);
	// Whole pages already held, so the next request picks up exactly where the
	// list ends.
	let nextPage = $derived(Math.floor(displayComments.length / COMMENTS_PAGE_SIZE) + 1);

	const sessionId = $derived(session?.id);

	async function loadPage(page: number) {
		const res = await fetch(`/api/post/${postId}/comments?page=${page}`);
		if (!res.ok) throw new Error("Erro ao buscar comentários");

		const data: CommentsPageType = await res.json();

		fetchedComments =
			page === 1 && comments === undefined ? data.items : [...fetchedComments, ...data.items];
		fetchedTotalCount = data.pagination.totalCount;
	}

	async function loadMore() {
		if (isLoadingMore) return;
		isLoadingMore = true;
		try {
			await loadPage(nextPage);
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
