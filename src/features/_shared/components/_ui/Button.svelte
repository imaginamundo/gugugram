<script lang="ts" module>
	import type { HTMLButtonAttributes } from "svelte/elements";
	import type { WithElementRef } from "@ui/utils.ts";

	type ButtonProps = WithElementRef<HTMLButtonAttributes, HTMLButtonElement>;
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		disabled,
		tabindex = 0,
		class: className,
		children,
		...props
	}: ButtonProps = $props();

	const classes = $derived(["button", className]);
</script>

<button bind:this={ref} {disabled} {...props} {tabindex} class={classes}>
	{@render children?.()}
</button>
