<script lang="ts" module>
	import type { HTMLTextareaAttributes } from "svelte/elements";
	import type { WithElementRef } from "@ui/types";

	export type InputProps = WithElementRef<HTMLTextareaAttributes, HTMLTextAreaElement> & {
		characterCount?: boolean;
	};
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		value = $bindable(),
		class: className,
		maxlength,
		characterCount = false,
		...props
	}: InputProps = $props();
</script>

<textarea bind:this={ref} bind:value class={["textarea", className]} {maxlength} {...props}
></textarea>
{#if characterCount && maxlength && typeof value === "string"}
	<span class="helper-text">{value?.length} / {maxlength} caracteres</span>
{/if}
