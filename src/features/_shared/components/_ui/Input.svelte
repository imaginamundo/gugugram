<script lang="ts" module>
	import type { HTMLInputAttributes } from "svelte/elements";
	import type { WithElementRef } from "@ui/utils.ts";

	export type InputProps = WithElementRef<HTMLInputAttributes, HTMLInputElement>;
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		value = $bindable(),
		files = $bindable(),
		type = 'text',
		class: className,
		...props
	}: InputProps = $props();

	const classes = $derived(["input", className]);
</script>

{#if type === "file"}
	<input bind:this={ref} type="file" bind:value bind:files  class={classes} {...props} />
{:else}
	<input bind:this={ref} bind:value {type} class={classes} {...props} />
{/if}
