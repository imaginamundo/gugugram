<script lang="ts" module>
	import type { HTMLInputAttributes } from "svelte/elements";
	import type { WithElementRef } from "@ui/types";

	export type InputProps = WithElementRef<HTMLInputAttributes, HTMLInputElement> & {
		characterCount?: boolean;
	};
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		value = $bindable(),
		files = $bindable(),
		type = "text",
		maxlength,
		characterCount = false,
		class: className,
		...props
	}: InputProps = $props();

	const classes = $derived(["input", className]);
</script>

{#if type === "file"}
	<input bind:this={ref} type="file" bind:files class={classes} {...props} />
{:else}
	<input bind:this={ref} bind:value {type} class={classes} {maxlength} {...props} />
{/if}
{#if characterCount && maxlength && typeof value === "string"}
	<span class="helper-text">{value?.length} / {maxlength} caracteres</span>
{/if}
