<script lang="ts">
  import { actions } from "astro:actions";
  import Button from "@components/_ui/Button.svelte";
  import Modal from "@components/_ui/Modal.svelte";
	import type { ProfileUser } from "@services/user";
  
  const { user }: { user: ProfileUser } = $props();

  let modalRef = $state<HTMLDialogElement | null>(null);
</script>

<fieldset class="mb">
  <legend>Imagem de perfil</legend>
  <div class="flex gap center">
    <img src={user.image} alt={`Imagem de perfil de ${user.username}`}>
    <Button onclick={() => modalRef?.showModal()}>Apagar imagem de perfil atual</Button>
  </div>
</fieldset>

<Modal bind:ref={modalRef}>
  <div class="title-bar"><p><strong>Atenção</strong></p></div>
  <div class="window-body">
    <p>Certeza que quer deletar essa imagem?</p>
    <div class="flex gap justify-center mt">
      <form action={actions.removeProfileImage} method="POST" class="flex gap">
        <Button>
          <img src="/icons/recycle_bin_empty-1.png" alt="Ícone de restrição" />
          Quero apagar essa imagem
        </Button>
      </form>
      <Button onclick={() => modalRef?.close()} autofocus>Cancelar</Button>
    </div>
  </div>
</Modal>