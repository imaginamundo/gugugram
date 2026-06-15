<script lang="ts">
	import { actions } from "astro:actions";
	import Button from "@ui/Button.svelte";
	import Textarea from "@ui/Textarea.svelte";

	interface Props {
		postId: string;
	}

	const { postId }: Props = $props();

	const CONTENT_MAX = 2000;

	let content = $state("");
	let loading = $state(false);
	let actionError = $state("");
	let success = $state(false);

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		loading = true;
		actionError = "";
		success = false;

		try {
			const formData = new FormData();
			formData.append("postId", postId);
			formData.append("content", content);

			const { data, error } = await actions.createResponse(formData);

			if (error) {
				actionError = error.message;
				return;
			}

			if (data?.success) {
				content = "";
				success = true;
				window.location.reload();
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

	{#if success}
		<p class="mb" role="status">Resposta publicada com sucesso!</p>
	{/if}

	<form class="form" onsubmit={handleSubmit}>
		<fieldset>
			<legend>Responder post</legend>
			<label class="label">
				Conteúdo
				<Textarea
					name="content"
					rows={4}
					class="w-full"
					maxlength={CONTENT_MAX}
					placeholder="Escreva sua resposta"
					characterCount
					required
					bind:value={content}
				/>
			</label>

			<div class="flex justify-end mt">
				<Button type="submit" disabled={loading}>
					{loading ? "Enviando..." : "Responder"}
				</Button>
			</div>
		</fieldset>
	</form>
</div>
