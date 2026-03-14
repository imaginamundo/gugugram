<script lang="ts">
	import { draggableDialog } from "@utils/draggableDialog.ts";
	import Button from "@ui/Button.svelte";
	import Modal from "@ui/Modal.svelte";
	import { imageModalStore as store } from "./imagePostModalStore.svelte";
	import ImagePostDetails from "@components/post/ImagePostDetails/ImagePostDetails.svelte";
	import DeleteImagePost from "@components/post/DeleteImagePost/DeleteImagePost.svelte";

	let closeButtonRef = $state<HTMLButtonElement | null>(null);
	let imageModalRef = $state<HTMLDialogElement | null>(null);

	const { session }: { session: App.Locals["user"] } = $props();

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
		<div class="title-bar" {@attach draggableDialog}>
			<p><strong>Detalhes da imagem</strong></p>
		</div>
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
