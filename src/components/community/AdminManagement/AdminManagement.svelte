<script lang="ts">
	import { actions } from "astro:actions";
	import { draggableDialog } from "@utils/draggableDialog.ts";
	import Button from "@ui/Button.svelte";
	import Input from "@ui/Input.svelte";
	import Modal from "@ui/Modal.svelte";

	interface Admin {
		id: string;
		username: string;
	}

	interface Props {
		communityId: string;
		admins: Admin[];
	}

	let { communityId, admins: initialAdmins }: Props = $props();

	let admins = $state<Admin[]>(initialAdmins);
	let actionError = $state("");
	let loading = $state(false);

	// Promote admin state
	let promoteUserId = $state("");
	let promoteError = $state("");
	let promoteLoading = $state(false);

	// Remove admin modal
	let removeModalRef = $state<HTMLDialogElement | null>(null);
	let adminToRemove = $state<Admin | null>(null);

	// Transfer ownership modal
	let transferModalRef = $state<HTMLDialogElement | null>(null);
	let adminToTransfer = $state<Admin | null>(null);

	function openRemoveModal(admin: Admin) {
		adminToRemove = admin;
		removeModalRef?.showModal();
	}

	function openTransferModal(admin: Admin) {
		adminToTransfer = admin;
		transferModalRef?.showModal();
	}

	async function handlePromote(e: SubmitEvent) {
		e.preventDefault();
		promoteLoading = true;
		promoteError = "";

		try {
			const formData = new FormData();
			formData.append("communityId", communityId);
			formData.append("targetUserId", promoteUserId);

			const { data, error } = await actions.promoteAdmin(formData);

			if (error) {
				promoteError = error.message;
				return;
			}

			if (data?.success) {
				admins = [...admins, { id: promoteUserId, username: promoteUserId }];
				promoteUserId = "";
				window.location.reload();
			}
		} catch {
			promoteError = "Erro inesperado. Tente novamente.";
		} finally {
			promoteLoading = false;
		}
	}

	async function handleRemoveAdmin() {
		if (!adminToRemove) return;
		loading = true;
		actionError = "";

		try {
			const formData = new FormData();
			formData.append("communityId", communityId);
			formData.append("targetUserId", adminToRemove.id);

			const { data, error } = await actions.removeAdmin(formData);

			if (error) {
				actionError = error.message;
				removeModalRef?.close();
				return;
			}

			if (data?.success) {
				admins = admins.filter((a) => a.id !== adminToRemove!.id);
				removeModalRef?.close();
				adminToRemove = null;
			}
		} catch {
			actionError = "Erro inesperado. Tente novamente.";
			removeModalRef?.close();
		} finally {
			loading = false;
		}
	}

	async function handleTransferOwnership() {
		if (!adminToTransfer) return;
		loading = true;
		actionError = "";

		try {
			const formData = new FormData();
			formData.append("communityId", communityId);
			formData.append("newOwnerId", adminToTransfer.id);

			const { data, error } = await actions.transferOwnership(formData);

			if (error) {
				actionError = error.message;
				transferModalRef?.close();
				return;
			}

			if (data?.success) {
				transferModalRef?.close();
				window.location.reload();
			}
		} catch {
			actionError = "Erro inesperado. Tente novamente.";
			transferModalRef?.close();
		} finally {
			loading = false;
		}
	}
</script>

<div class="window">
	<div class="title-bar">
		<p><strong>Gerenciar administradores</strong></p>
	</div>
	<div class="window-body">
		{#if actionError}
			<p class="helper-error mb flex center gap" role="alert">
				<img src="/icons/msg_error-0.png" alt="Ícone de erro" />
				{actionError}
			</p>
		{/if}

		<fieldset>
			<legend>Administradores atuais</legend>
			{#if admins.length === 0}
				<p class="text-muted p-sm">Nenhum administrador ainda.</p>
			{:else}
				<ul class="p-0" style="list-style: none; margin: 0;">
					{#each admins as admin (admin.id)}
						<li class="flex center justify-between gap mb-sm">
							<span>{admin.username}</span>
							<span class="flex gap-sm">
								<Button
									onclick={() => openTransferModal(admin)}
									disabled={loading}
									class="button-grayscale"
								>
									Transferir posse
								</Button>
								<Button
									onclick={() => openRemoveModal(admin)}
									disabled={loading}
									class="button-grayscale"
								>
									Remover
								</Button>
							</span>
						</li>
					{/each}
				</ul>
			{/if}
		</fieldset>

		<fieldset class="mt">
			<legend>Promover usuário a admin</legend>
			{#if promoteError}
				<p class="helper-error mb" role="alert">{promoteError}</p>
			{/if}
			<form onsubmit={handlePromote}>
				<label class="label">
					ID do usuário
					<Input
						name="targetUserId"
						type="text"
						class="w-full"
						placeholder="ID do usuário"
						required
						bind:value={promoteUserId}
					/>
				</label>
				<div class="flex justify-end mt-sm">
					<Button type="submit" disabled={promoteLoading}>
						{promoteLoading ? "Promovendo..." : "Promover a admin"}
					</Button>
				</div>
			</form>
		</fieldset>
	</div>
</div>

<!-- Remove admin confirmation modal -->
<Modal bind:ref={removeModalRef}>
	<div class="title-bar" {@attach draggableDialog}>
		<p><strong>Remover administrador</strong></p>
	</div>
	<div class="window-body">
		<p class="mb">
			Tem certeza que deseja remover <strong>{adminToRemove?.username}</strong> como administrador?
		</p>
		<div class="flex gap justify-center mt">
			<Button onclick={handleRemoveAdmin} disabled={loading}>
				{loading ? "Removendo..." : "Sim, remover"}
			</Button>
			<Button onclick={() => removeModalRef?.close()} autofocus>Cancelar</Button>
		</div>
	</div>
</Modal>

<!-- Transfer ownership confirmation modal -->
<Modal bind:ref={transferModalRef}>
	<div class="title-bar" {@attach draggableDialog}>
		<p><strong>Transferir propriedade</strong></p>
	</div>
	<div class="window-body">
		<p class="mb">
			Tem certeza que deseja transferir a propriedade da comunidade para
			<strong>{adminToTransfer?.username}</strong>? Você perderá o papel de dono.
		</p>
		<div class="flex gap justify-center mt">
			<Button onclick={handleTransferOwnership} disabled={loading}>
				{loading ? "Transferindo..." : "Sim, transferir"}
			</Button>
			<Button onclick={() => transferModalRef?.close()} autofocus>Cancelar</Button>
		</div>
	</div>
</Modal>
