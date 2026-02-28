<script lang="ts">
	import { actions } from "astro:actions";
	import Button from "@components/_ui/Button.svelte";
	import Modal from "@components/_ui/Modal.svelte";
	import { imageModalStore as store } from "@stores/imageModalStore.svelte";

	let closeButtonRef = $state<HTMLButtonElement | null>(null);
	let imageModalRef = $state<HTMLDialogElement | null>(null);
	let removeImageModalRef = $state<HTMLDialogElement | null>(null);

	const { session }: { session: App.Locals['user'] } = $props();

	$effect(() => {
		if (store.post) {
			if (imageModalRef && !imageModalRef.open) {
				imageModalRef.showModal();
			}
			
			closeButtonRef?.focus();
		} else {
			if (imageModalRef && imageModalRef.open) {
				imageModalRef.close();
			}
		}
	});
</script>

<Modal bind:ref={imageModalRef} onclose={() => store.clear()}>
	{#if store.post}
		<div class="title-bar"><p><strong>Gugugram</strong></p></div>
		<div class="window-body">
			<figure>
				<img src={store.post.image} alt={`Imagem por ${store.post.username}`} class="w-full image-border" />
				<figcaption class="p">
					Imagem por <a href={`/${store.post.username}`}>{store.post.username}</a>
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
