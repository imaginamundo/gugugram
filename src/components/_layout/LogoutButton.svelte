<script lang="ts">
	import { draggableDialog } from "@utils/draggableDialog.ts";
	import Button from "@ui/Button.svelte";
	import Modal from "@ui/Modal.svelte";
	import { resetTracking, trackEvent } from "@utils/tracking";

	let modalRef = $state<HTMLDialogElement | null>(null);

	function handleOpenModal(e: SubmitEvent) {
		e.preventDefault();
		modalRef?.showModal();
	}

	function handleLogout(e: SubmitEvent) {
		e.preventDefault();

		trackEvent("user_logged_out");

		resetTracking();

		const form = e.target as HTMLFormElement;

		setTimeout(() => {
    		// Log out via fetch instead of a programmatic form.submit(): Safari
    		// sends Origin: null for script-initiated form submissions (which the
    		// origin check would reject)
			fetch(form.action, { method: "POST", credentials: "same-origin" }).finally(() => {
				window.location.href = "/";
			});
		}, 250);
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
			<form action="/api/logout" method="POST" onsubmit={handleLogout}>
				<Button type="submit">
					<img src="/icons/trust1_restric-1.png" alt="" aria-hidden="true" />
					Sim, quero sair
				</Button>
			</form>
			<Button type="button" onclick={() => modalRef?.close()} autofocus>Cancelar</Button>
		</div>
	</div>
</Modal>
