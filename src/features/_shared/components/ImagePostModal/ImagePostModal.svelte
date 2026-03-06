<script lang="ts">
	import Button from "@components/_ui/Button.svelte";
	import Modal from "@components/_ui/Modal.svelte";
	import ImagePostDetails from "@components/ImagePostDetails/ImagePostDetails.svelte";
	import { imageModalStore as store } from "@stores/imageModalStore.svelte";
	import DeleteImagePost from "@components/DeleteImagePost/DeleteImagePost.svelte";

	let closeButtonRef = $state<HTMLButtonElement | null>(null);
	let imageModalRef = $state<HTMLDialogElement | null>(null);

	const { session }: { session: App.Locals["user"]; } = $props();

  let profilePath = $state("");

  $effect(() => {
    if (store.post) {
      if (imageModalRef && !imageModalRef.open) imageModalRef.showModal();
      closeButtonRef?.focus();
    } else if (imageModalRef?.open) {
      imageModalRef.close();
    }
  });

  $effect(() => {
    if (store.post) {
      const expectedPath = `/${store.post.username}/${store.post.id}`;
      if (window.location.pathname !== expectedPath) {
        profilePath = profilePath || window.location.pathname; 
        window.history.replaceState({}, "", expectedPath);
      }
    } else if (profilePath && window.location.pathname !== profilePath) {
      window.history.replaceState({}, "", profilePath);
      profilePath = "";
    }
  });

  function handleModalClose() {
    store.clear();
  }
</script>

<Modal bind:ref={imageModalRef} class="modal-lg" onclose={handleModalClose}>
	{#if store.post}
		<div class="title-bar"><p><strong>Detalhes da imagem</strong></p></div>
		<div class="window-body">
			<ImagePostDetails {session} post={store.post} />
			<div class="flex gap justify-between row-reverse">
				<Button bind:ref={closeButtonRef} onclick={() => store.clear()} autofocus>Fechar</Button>
				{#if session?.id === store.post.userId}
					<div class="flex center gap">
						<DeleteImagePost post={store.post} />
						Não pode ser desfeito!
					</div>
				{/if}
			</div>
		</div>
	{/if}
</Modal>