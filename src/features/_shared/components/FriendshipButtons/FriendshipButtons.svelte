<script lang="ts">
  import { actions } from "astro:actions";
  import Button from "@components/_ui/Button.svelte";
  import Modal from "@components/_ui/Modal.svelte";
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

  let parameter = $derived(additionalParameter ? `&${additionalParameter}` : '');

  type ActionType = "send" | "remove" | "cancel" | "accept" | "reject" | null;
  
  let modalRef = $state<HTMLDialogElement | null>(null);
  let currentAction = $state<ActionType>(null);

  function openModal(action: ActionType) {
    currentAction = action;
    modalRef?.showModal();
  }

  let modalContent = $derived.by(() => {
    switch (currentAction) {
      case "send": return {
        title: "Iniciar amizade",
        text: "Deseja enviar uma solicitação de amizade?",
        action: actions.sendFriendRequest,
        icon: "/icons/utopia_smiley.png",
        btnText: "Enviar solicitação"
      };
      case "remove": return {
        title: "Remover amizade",
        text: "Tem certeza que deseja remover esta pessoa das suas amizades?",
        action: actions.removeFriendship,
        icon: "/icons/trust1_restric-1.png",
        btnText: "Remover amizade"
      };
      case "cancel": return {
        title: "Cancelar solicitação",
        text: "Deseja cancelar a solicitação de amizade enviada?",
        action: actions.removeFriendship,
        icon: null,
        btnText: "Cancelar solicitação"
      };
      case "accept": return {
        title: "Aceitar solicitação",
        text: "Deseja aceitar esta solicitação de amizade?",
        action: actions.acceptFriendRequest,
        icon: "/icons/trust0-1.png",
        btnText: "Aceitar solicitação"
      };
      case "reject": return {
        title: "Rejeitar solicitação",
        text: "Deseja rejeitar esta solicitação de amizade?",
        action: actions.removeFriendship,
        icon: "/icons/trust1_restric-1.png",
        btnText: "Rejeitar"
      };
      default: return null;
    }
  });
</script>

{#if isLoggedIn && !isOwnProfile}
  <div>
    {#if !friendship?.status}
      <Button onclick={() => openModal("send")}>
        <img src="/icons/utopia_smiley.png" alt="Ícone de smile" />
        Iniciar amizade
      </Button>
    {/if}

    {#if friendship?.status === "accepted"}
      <Button onclick={() => openModal("remove")}>
        <img src="/icons/trust1_restric-1.png" alt="Ícone de restrição" />
        Remover amizade
      </Button>
    {/if}

    {#if friendship?.status === "pending" && friendship?.type === "request"}
      <Button onclick={() => openModal("cancel")}>
        Cancelar solicitação
      </Button>
    {/if}

    {#if friendship?.status === "pending" && friendship?.type === "target"}
      <Button onclick={() => openModal("accept")}>
        <img src="/icons/trust0-1.png" alt="Ícone de check" />
        Aceitar solicitação
      </Button>
      <Button onclick={() => openModal("reject")}>
        <img src="/icons/trust1_restric-1.png" alt="Ícone de restrição" />
        Rejeitar solicitação
      </Button>
    {/if}
  </div>
{/if}

<Modal bind:ref={modalRef} onclose={() => currentAction = null}>
  {#if modalContent}
    <div class="title-bar"><p><strong>{modalContent.title}</strong></p></div>
    <div class="window-body">
      <p>{modalContent.text}</p>
      <div class="flex gap justify-center mt">
        
        <form method="POST" action={modalContent.action + parameter} class="flex gap">
          <input type="hidden" name="targetUserId" value={targetUserId} />
          <Button type="submit">
            {#if modalContent.icon}
              <img src={modalContent.icon} alt="Ícone da ação" />
            {/if}
            {modalContent.btnText}
          </Button>
        </form>

        <Button onclick={() => modalRef?.close()} autofocus>Cancelar</Button>
      </div>
    </div>
  {/if}
</Modal>