<script lang="ts">
  import { actions } from "astro:actions";
  import Button from "@components/_ui/Button.svelte";
  import type { FriendshipContext } from "@services/user"; 

  let {
    targetUserId,
    friendship,
    isLoggedIn = false,
    isOwnProfile = false,
    additionalParameter,
  }: {
    targetUserId: string;
    friendship?: FriendshipContext | null;
    isLoggedIn: boolean;
    isOwnProfile: boolean;
    additionalParameter?: string,
  } = $props();

  // svelte-ignore state_referenced_locally
    const parameter = additionalParameter ? `&${additionalParameter}` : '';
</script>

{#if isLoggedIn && !isOwnProfile}
  <div class="friendship-actions">
    {#if !friendship?.status}
      <form method="POST" action={actions.sendFriendRequest + parameter}>
        <input type="hidden" name="targetUserId" value={targetUserId} />
        <Button type="submit">
          <img src="/icons/utopia_smiley.png" alt="Ícone de smile" />
          Iniciar amizade
        </Button>
      </form>
    {/if}

    {#if friendship?.status === "accepted"}
      <form method="POST" action={actions.removeFriendship + parameter}>
        <input type="hidden" name="targetUserId" value={targetUserId} />
        <Button type="submit">
          <img src="/icons/trust1_restric-1.png" alt="Ícone de restrição" />
          Remover amizade
        </Button>
      </form>
    {/if}

    {#if friendship?.status === "pending" && friendship?.type === "request"}
      <form method="POST" action={actions.removeFriendship + parameter}>
        <input type="hidden" name="targetUserId" value={targetUserId} />
        <Button type="submit">Cancelar solicitação</Button>
      </form>
    {/if}

    {#if friendship?.status === "pending" && friendship?.type === "target"}
      <form method="POST" action={actions.acceptFriendRequest + parameter}>
        <input type="hidden" name="targetUserId" value={targetUserId} />
        <Button type="submit">
          <img src="/icons/trust0-1.png" alt="Ícone de check" />
          Aceitar solicitação
        </Button>
      </form>
      <form method="POST" action={actions.removeFriendship + parameter}>
        <input type="hidden" name="targetUserId" value={targetUserId} />
        <Button type="submit">
          <img src="/icons/trust1_restric-1.png" alt="Ícone de restrição" />
          Rejeitar solicitação
        </Button>
      </form>
    {/if}
  </div>
{/if}
