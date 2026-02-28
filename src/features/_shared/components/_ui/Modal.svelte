<script lang="ts">
    import type { HTMLDialogAttributes } from "svelte/elements";
    import type { WithElementRef } from "@ui/utils.ts";

    let {
        ref = $bindable(null),
        children,
        ...props
    }: WithElementRef<HTMLDialogAttributes, HTMLDialogElement> = $props();
</script>

<dialog
    class="modal window"
    bind:this={ref}
    onclick={(e) => {
        if (e.target === ref) ref?.close();
    }}
    {...props}
>
    {@render children?.()}
</dialog>
