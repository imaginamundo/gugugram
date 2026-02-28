<script lang="ts" module>
	import type { HTMLTextareaAttributes } from "svelte/elements";
	import type { WithElementRef } from "@ui/utils.ts";

	export type InputProps = WithElementRef<HTMLTextareaAttributes, HTMLTextAreaElement>;
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		value = $bindable(),
		class: className,
		...props
	}: InputProps = $props();
</script>

<textarea bind:this={ref} bind:value class={['textarea', className]} {...props}></textarea>
