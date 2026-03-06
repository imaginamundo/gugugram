<script lang="ts">
    import type { HTMLDialogAttributes } from "svelte/elements";
    import type { WithElementRef } from "@ui/utils.ts";

    let {
        ref = $bindable(null),
        children,
        class: className,
        ...props
    }: WithElementRef<HTMLDialogAttributes, HTMLDialogElement> = $props();

    const classes = $derived(["modal window", className]);
</script>

<dialog
    class={classes}
    bind:this={ref}
    onclick={(e) => {
        if (e.target === ref) ref?.close();
    }}
    {...props}
>
    {@render children?.()}
</dialog>
