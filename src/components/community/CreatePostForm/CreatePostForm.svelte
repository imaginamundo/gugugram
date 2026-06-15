<script lang="ts">
	import { actions } from "astro:actions";
	import Button from "@ui/Button.svelte";
	import Input from "@ui/Input.svelte";
	import Textarea from "@ui/Textarea.svelte";

	interface Props {
		communityId: string;
		communitySlug: string;
	}

	const { communityId, communitySlug }: Props = $props();

	const TITLE_MAX = 150;
	const CONTENT_MAX = 5000;

	let title = $state("");
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
			formData.append("communityId", communityId);
			formData.append("title", title);
			formData.append("content", content);

			const { data, error } = await actions.createPost(formData);

			if (error) {
				actionError = error.message;
				return;
			}

			if (data?.success) {
				window.location.href = `/comunidades/${communitySlug}/${data.id}`;
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
		<p class="mb" role="status">Post publicado com sucesso!</p>
	{/if}

	<form class="form" onsubmit={handleSubmit}>
		<fieldset>
			<legend>Novo post</legend>
			<label class="label">
				Título
				<Input
					name="title"
					type="text"
					class="w-full"
					minlength={3}
					maxlength={TITLE_MAX}
					placeholder="Título do post"
					characterCount
					required
					bind:value={title}
				/>
			</label>

			<label class="label mt">
				Conteúdo
				<Textarea
					name="content"
					rows={5}
					class="w-full"
					maxlength={CONTENT_MAX}
					placeholder="Escreva o conteúdo do post"
					bind:value={content}
					characterCount
					required
				/>
			</label>

			<div class="flex justify-end mt">
				<Button type="submit" disabled={loading}>
					{loading ? "Publicando..." : "Publicar post"}
				</Button>
			</div>
		</fieldset>
	</form>
</div>
