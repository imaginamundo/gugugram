<script lang="ts">
	import type { HTMLInputAttributes } from "svelte/elements";
	import type { WithElementRef } from "@ui/types";

	type InputProps = WithElementRef<Omit<HTMLInputAttributes, "type">, HTMLInputElement>;

	let {
		ref = $bindable(null),
		value,
		group = $bindable(),
		class: className,
		...props
	}: InputProps = $props();
</script>

<input bind:this={ref} type="radio" class={["radio", className]} {value} bind:group {...props} />
