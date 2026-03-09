<script lang="ts">
    import type { HTMLDialogAttributes } from "svelte/elements";
    import type { WithElementRef } from "@ui/utils.ts";

    let {
        ref = $bindable(null),
        children,
        class: className,
        useAction,
        actionParams,
        title,
        showCloseButton = true,
        onclose,
        ...props
    }: WithElementRef<HTMLDialogAttributes, HTMLDialogElement> & { 
        useAction?: (node: HTMLElement, params: any) => any;
        actionParams?: any;
        title?: string;
        showCloseButton?: boolean;
    } = $props();

    const classes = $derived(["modal window", className]);

    $effect(() => {
        if (ref) {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.attributeName === "open") {
                        if (ref?.open) {
                            // Reset position on open to ensure it's centered
                            ref.style.left = "";
                            ref.style.top = "";
                            ref.style.position = "";
                            ref.style.margin = "";
                        }
                    }
                });
            });

            observer.observe(ref, { attributes: true });

            return () => observer.disconnect();
        }
    });

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
    {onclose}
    {...props}
>
    {#if title}
        <div class="title-bar">
            <p><strong>{title}</strong></p>
            {#if showCloseButton}
                <button
                    type="button"
                    class="close-button"
                    aria-label="Fechar"
                    onclick={() => ref?.close()}
                ></button>
            {/if}
        </div>
    {/if}
    {@render children?.()}
</dialog>
