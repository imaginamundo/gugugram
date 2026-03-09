<script lang="ts">
    import type { HTMLDialogAttributes } from "svelte/elements";
    import type { WithElementRef } from "@ui/utils.ts";

    let {
        ref = $bindable(null),
        children,
        class: className,
        useAction,
        actionParams,
        ...props
    }: WithElementRef<HTMLDialogAttributes, HTMLDialogElement> & { 
        useAction?: (node: HTMLElement, params: any) => any;
        actionParams?: any;
    } = $props();

    const classes = $derived(["modal window", className]);

    function setupAction(node: HTMLElement) {
        if (useAction) {
            return useAction(node, actionParams);
        }
    }
</script>

<dialog
    class={classes}
    bind:this={ref}
    use:setupAction
    onclick={(e) => {
        if (e.target === ref) ref?.close();
    }}
    {...props}
>
    {@render children?.()}
</dialog>
