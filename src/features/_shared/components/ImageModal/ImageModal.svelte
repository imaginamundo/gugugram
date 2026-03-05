<script lang="ts">
	import { onMount } from "svelte";
	import { actions } from "astro:actions";
	import { formatDate } from "@utils/date";
	import Button from "@components/_ui/Button.svelte";
	import Modal from "@components/_ui/Modal.svelte";
	import { imageModalStore as store } from "@stores/imageModalStore.svelte";
	import type { PostType } from "@services/image";

	let closeButtonRef = $state<HTMLButtonElement | null>(null);
	let imageModalRef = $state<HTMLDialogElement | null>(null);
	let removeImageModalRef = $state<HTMLDialogElement | null>(null);

	const { session, post: prefetchedPost }: { session: App.Locals["user"], post: PostType | null } = $props();

	onMount(() => {
		if (prefetchedPost) {
			store.post = prefetchedPost;
		}
		
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      if (!params.has("post")) {
        store.clear();
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  });
	
	$effect(() => {
		
    if (store.post) {
      if (imageModalRef && !imageModalRef.open) {
        imageModalRef.showModal();
      }
      closeButtonRef?.focus();

      const url = new URL(window.location.href);
      if (url.searchParams.get("post") !== store.post.id) {
        url.searchParams.set("post", store.post.id);
        window.history.pushState({}, "", url);
      }
    } else {
      if (imageModalRef && imageModalRef.open) {
        imageModalRef.close();
      }

      const url = new URL(window.location.href);
      if (url.searchParams.has("post")) {
        url.searchParams.delete("post");
        window.history.pushState({}, "", url);
      }
    }
  });

	function handleModalClose() {
		store.clear();
	}
</script>

<Modal bind:ref={imageModalRef} onclose={handleModalClose}>
	{#if store.post}
		<div class="title-bar"><p><strong>Gugugram</strong></p></div>
		<div class="window-body">
			<figure>
				<img
					src={store.post.image}
					alt={`Imagem por ${store.post.username}`}
					class="w-full image-border"
					fetchpriority="high"
					loading="eager"
				/>
				<figcaption class="description mt mb">
					({formatDate(store.post.createdAt)})
					<a href={`/${store.post.username}`}>{store.post.username}</a>
					{#if store.post.description}
						escreveu:
						<p class="field-border mt p description-content">{store.post.description}</p>
					{/if}
				</figcaption>
			</figure>
			<div class="flex gap justify-between row-reverse">
				<Button bind:ref={closeButtonRef} onclick={() => store.clear()} autofocus>Fechar</Button>
				{#if session?.id === store.post.userId}
					<div class="flex center gap">
						<Button onclick={() => removeImageModalRef?.showModal()}>
							<img src="/icons/trust1_restric-1.png" alt="Ícone de restrição" />
							Apagar imagem
						</Button>
						Não pode ser desfeito!
					</div>
				{/if}
			</div>
		</div>
	{/if}
</Modal>

<Modal bind:ref={removeImageModalRef}>
	{#if store.post}
		<div class="title-bar"><p><strong>Atenção</strong></p></div>
		<div class="window-body">
			<p>Certeza que quer deletar essa imagem?</p>
			<div class="flex gap justify-center mt">
				<form action={actions.deleteImage} method="POST" class="flex gap">
					<input type="hidden" name="id" value={store.post.id} />
					<input type="hidden" name="imageUrl" value={store.post.image} />
					<Button>
						<img src="/icons/recycle_bin_empty-1.png" alt="Ícone de restrição" />
						Quero apagar essa imagem
					</Button>
				</form>
				<Button onclick={() => removeImageModalRef?.close()} autofocus>Cancelar</Button>
			</div>
		</div>
	{/if}
</Modal>

<style>
	.description {
		text-align: left;
	}
	.description-content {
		background: #fff;
		overflow-wrap: break-word;
	}
</style>
