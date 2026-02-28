<script lang="ts" module>
	import type { HTMLInputAttributes } from "svelte/elements";
	import type { WithElementRef } from "@ui/utils.ts";

	export type InputProps = WithElementRef<Omit<HTMLInputAttributes, 'type'>, HTMLInputElement>;
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		checked = $bindable(false),
		indeterminate = $bindable(false),
		class: className,
		...props
	}: InputProps = $props();
</script>

<input bind:this={ref} type="checkbox" class={['checkbox', className]} bind:checked bind:indeterminate {...props} />
