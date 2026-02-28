<script lang="ts">
	import type { Snippet } from "svelte";

  type SelectTabType = 'fotos' | 'recados' | 'amigos';

	const {
    selectedTab,
		username,
		messagesCount,
		friendsCount,
		pendingFriendRequest,
		children,
	}: {
    selectedTab: SelectTabType;
		username: string;
		messagesCount: number;
		friendsCount: number;
		pendingFriendRequest: boolean;
		children: Snippet;
	} = $props();

  const tabs = [
    {
      id: 'fotos',
      label: 'Fotos',
      href: `/${username}`,
      icon: '/icons/camera-3.png',
      alt: 'Ícone de uma câmera'
    },
    {
      id: 'recados',
      label: `${messagesCount} recados`,
      href: `/${username}/recados`,
      icon: '/icons/envelope_closed-1.png',
      alt: 'Ícone de um envelope fechado'
    },
    {
      id: 'amigos',
      label: `${friendsCount} amigos ${pendingFriendRequest ? "*" : ""}`,
      href: `/${username}/amigos`,
      icon: '/icons/user_computer_pair-1.png',
      alt: 'Ícone de duas pessoas e um computador'
    }
  ] as const;
</script>

<menu class="tablist mt">
  {#each tabs as tab}
    <li role="tab" aria-selected={tab.id === selectedTab}>
      <a href={tab.href}>
        <img src={tab.icon} alt={tab.alt} />
        {tab.label}
      </a>
    </li>
  {/each}
</menu>
<div class="window" role="tabpanel">
	<div class="window-body">
		{@render children?.()}
	</div>
</div>
