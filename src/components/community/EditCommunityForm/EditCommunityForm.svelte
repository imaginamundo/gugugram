<script lang="ts">
	import { actions } from "astro:actions";
	import Button from "@ui/Button.svelte";
	import Textarea from "@ui/Textarea.svelte";
	import type { CommunityType } from "@customTypes/community";

	interface Props {
		community: CommunityType;
	}

	const { community }: Props = $props();

	const DESC_MAX = 500;

	// svelte-ignore state_referenced_locally
	let description = $state(community.description ?? "");
	let loading = $state(false);
	let actionError = $state("");

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		loading = true;
		actionError = "";

		try {
			const formData = new FormData(e.currentTarget as HTMLFormElement);
			const { data, error } = await actions.createCommunity(formData);

			if (error) {
				actionError = error.message;
				return;
			}

			if (data?.success) {
				window.location.href = `/comunidades/${data.slug}`;
			}
		} catch {
			actionError = "Erro inesperado. Tente novamente.";
		} finally {
			loading = false;
		}
	}
</script>

<div class="form p">
	{#if actionError}
		<p class="helper-error mb flex center gap" role="alert">
			<img src="/icons/msg_error-0.png" alt="Ícone de erro" />
			{actionError}
		</p>
	{/if}

	<form class="form" onsubmit={handleSubmit}>
		<fieldset>
			<legend>Editar comunidade</legend>
			<label class="label">
				<span>Descrição <span class="text-muted">(opcional)</span></span>
				<Textarea
					name="description"
					rows={4}
					class="w-full"
					maxlength={DESC_MAX}
					placeholder="Descreva o tema da comunidade"
					bind:value={description}
				/>
				<span class="helper-text">{description.length} / {DESC_MAX} caracteres</span>
			</label>

			<div class="flex justify-end mt">
				<Button type="submit" disabled={loading}>
					{loading ? "Criando..." : "Criar comunidade"}
				</Button>
			</div>
		</fieldset>
	</form>
</div>
