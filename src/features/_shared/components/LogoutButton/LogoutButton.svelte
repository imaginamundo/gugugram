<script lang="ts">
	import { draggableDialog } from "@utils/draggableDialog";
	import Button from "@components/_ui/Button.svelte";
	import Modal from "@components/_ui/Modal.svelte";

	let modalRef = $state<HTMLDialogElement | null>(null);

	function handleOpenModal(e: SubmitEvent) {
		e.preventDefault();
		modalRef?.showModal();
	}
</script>

<form action="/api/logout" method="POST" onsubmit={handleOpenModal}>
	<Button type="submit">Sair da conta</Button>
</form>

<Modal bind:ref={modalRef}>
	<div class="title-bar" {@attach draggableDialog}><p><strong>Sair da conta</strong></p></div>
	<div class="window-body">
		<p>Tem certeza que deseja sair da sua conta?</p>
		<div class="flex gap justify-center mt">
			<form action="/api/logout" method="POST">
				<Button type="submit">
					<img src="/icons/trust1_restric-1.png" alt="" aria-hidden="true" />
					Sim, quero sair
				</Button>
			</form>
			<Button type="button" onclick={() => modalRef?.close()} autofocus>Cancelar</Button>
		</div>
	</div>
</Modal>
