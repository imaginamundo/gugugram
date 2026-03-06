<script lang="ts">
  import { actions } from "astro:actions";
  import { formatDate } from "@utils/date";
  import Button from "@components/_ui/Button.svelte";
  import Input from "@components/_ui/Input.svelte";
  import type { CommentType } from "@services/image";

  const {
    comments,
    postId,
    postAuthorId,
    session,
  }: {
    comments: CommentType[];
    postId: string;
    postAuthorId: string;
    session?: App.Locals["user"];
  } = $props();
</script>

<div class="comments-section">
  <div class="mb-sm">
    <p><strong>Comentários ({comments.length})</strong></p>
  </div>

  {#if comments.length === 0}
    <p class="text-muted mb p field-border" style="background: #fff;">
      Nenhum comentário ainda. Seja o primeiro a comentar!
    </p>
  {:else}
    <div class="comments-list flex flex-col gap field-border p mb">
      {#each comments as comment}
        <div class="comment flex gap center mb-sm">
          {#if session && (session.id === comment.authorId || session.id === postAuthorId)}
            <form method="POST" action={actions.deleteImagePostComment}>
              <input type="hidden" name="commentId" value={comment.id} />
              <Button type="submit" aria-label={`Apagar comentário de ${comment.authorUsername}`}>
                Apagar
              </Button>
            </form>
          {/if}
          
          <div>
            <p>
              <span class="text-muted">
                (<time datetime={comment.createdAt.toISOString()}>{formatDate(comment.createdAt)}</time>)
              </span>
              <a href={`/${comment.authorUsername}`}>{comment.authorUsername}</a> disse:
            </p>
            <p class="pl comment-body">{comment.body}</p>
          </div>
        </div>
      {/each}
    </div>
  {/if}

  {#if session}
    <form method="POST" action={actions.sendImagePostComment} class="flex justify-stretch gap mt">
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
    <p class="mt text-muted">Você precisa estar logado para comentar.</p>
  {/if}
</div>

<style>
  .comments-list {
    background-color: #fff;
    max-height: 250px;
    overflow-y: auto;
  }

  .comment {
    align-items: flex-start;
  }

  .comment-body {
    overflow-wrap: break-word;
    margin-top: 2px;
  }
</style>