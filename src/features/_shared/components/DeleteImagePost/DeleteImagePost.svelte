<script lang="ts">
	import { actions } from "astro:actions";
	import Button from "@components/_ui/Button.svelte";
	import Modal from "@components/_ui/Modal.svelte";
	import type { PostType } from "@services/image";

	let removeImageModalRef = $state<HTMLDialogElement | null>(null);

	const {
		post,
	}: { post: PostType; } = $props();
</script>

<Button onclick={() => removeImageModalRef?.showModal()}>
	<img src="/icons/trust1_restric-1.png" alt="Ícone de restrição" />
	Apagar imagem
</Button>

<Modal bind:ref={removeImageModalRef} title="Atenção">
	{#if post}
		<div class="window-body">
			<p>Certeza que quer deletar essa imagem?</p>
			<div class="flex gap justify-center mt">
				<form action={actions.deleteImagePost} method="POST" class="flex gap">
					<input type="hidden" name="id" value={post.id} />
					<input type="hidden" name="imageUrl" value={post.image} />
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
