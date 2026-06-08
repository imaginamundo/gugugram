<script lang="ts">
	import { actions } from "astro:actions";
	import Button from "@ui/Button.svelte";
	import Input from "@ui/Input.svelte";
	import Textarea from "@ui/Textarea.svelte";
	import InputImage from "@ui/InputImage.svelte";

	const TITLE_MAX = 100;
	const DESC_MAX = 500;

	let title = $state("");
	let description = $state("");
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
			<legend>Criar comunidade</legend>
			<label class="label">
				Título
				<Input
					name="title"
					type="text"
					class="w-full"
					minlength={3}
					maxlength={TITLE_MAX}
					placeholder="Nome da comunidade"
					required
					bind:value={title}
				/>
				<span class="helper-text">{title.length} / {TITLE_MAX} caracteres</span>
			</label>

			<label class="label mt">
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

			<label class="label mt">
				<span>Imagem <span class="text-muted">(opcional)</span></span>
				<InputImage name="image" width={60} height={60} />
			</label>

			<div class="flex justify-end mt">
				<Button type="submit" disabled={loading}>
					{loading ? "Criando..." : "Criar comunidade"}
				</Button>
			</div>
		</fieldset>
	</form>
</div>
