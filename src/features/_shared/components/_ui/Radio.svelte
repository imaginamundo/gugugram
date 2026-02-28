<script lang="ts">
	import type { HTMLInputAttributes } from "svelte/elements";
	import type { WithElementRef } from "@ui/utils.ts";

	type InputProps = WithElementRef<Omit<HTMLInputAttributes, "type">, HTMLInputElement>;

	let {
		ref = $bindable(null),
		value,
		group = $bindable(),
		indeterminate = $bindable(false),
		class: className,
		...props
	}: InputProps = $props();
</script>

<input
	bind:this={ref}
	type="radio"
	class={["radio", className]}
	value={value}
	bind:group
	bind:indeterminate
	{...props}
/>
