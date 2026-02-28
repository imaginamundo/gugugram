<script lang="ts" module>
	import type { HTMLSelectAttributes } from "svelte/elements";
	import { type WithElementRef } from "@ui/utils.ts";

	export type InputProps = WithElementRef<Omit<HTMLSelectAttributes, 'type'>, HTMLSelectElement>;
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		value = $bindable(),
		children,
		class: className,
		...props
	}: InputProps = $props();
</script>

<select bind:this={ref} class={['select', className]} bind:value {...props}>
	{@render children?.()}
</select>
