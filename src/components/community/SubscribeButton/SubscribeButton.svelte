<script lang="ts">
	import { actions } from "astro:actions";
	import Button from "@ui/Button.svelte";

	interface Props {
		communityId: string;
		isSubscribed: boolean;
	}

	let { communityId, isSubscribed: initialSubscribed }: Props = $props();

	let subscribed = $state(initialSubscribed);
	let loading = $state(false);
	let actionError = $state("");

	async function handleToggle() {
		loading = true;
		actionError = "";

		try {
			const formData = new FormData();
			formData.append("communityId", communityId);

			const { data, error } = subscribed
				? await actions.unsubscribe(formData)
				: await actions.subscribe(formData);

			if (error) {
				actionError = error.message;
				return;
			}

			if (data?.success) {
				subscribed = !subscribed;
			}
		} catch {
			actionError = "Erro inesperado. Tente novamente.";
		} finally {
			loading = false;
		}
	}
</script>

<div>
	{#if actionError}
		<p class="helper-error mb" role="alert">{actionError}</p>
	{/if}
	<Button onclick={handleToggle} disabled={loading}>
		{#if loading}
			Aguarde…
		{:else if subscribed}
			Sair da comunidade
		{:else}
			Participar da comunidade
		{/if}
	</Button>
</div>
