<script lang="ts">
	import type { Snippet } from "svelte";

	type SelectTabType = "fotos" | "recados" | "amigos";

	let {
		selectedTab,
		username,
		messagesCount,
		unreadMessagesCount,
		friendsCount,
		pendingFriendRequest,
		children,
	}: {
		selectedTab: SelectTabType;
		username: string;
		messagesCount: number;
		unreadMessagesCount: number;
		pendingFriendRequest: number;
		friendsCount: number;
		children: Snippet;
	} = $props();

	let unreadMessages = $derived(unreadMessagesCount ? `(${unreadMessagesCount} novos)` : "");
	let pendingFriends = $derived(pendingFriendRequest ? `(${pendingFriendRequest} novos)` : "");

	let tabs = $derived([
		{
			id: "fotos",
			label: "Fotos",
			href: `/${username}`,
			icon: "/icons/camera-3.png",
		},
		{
			id: "recados",
			label: `${messagesCount} recados ${unreadMessages}`,
			href: `/${username}/recados`,
			icon: "/icons/envelope_closed-1.png",
		},
		{
			id: "amigos",
			label: `${friendsCount} amigos ${pendingFriends}`,
			href: `/${username}/amigos`,
			icon: "/icons/user_computer_pair-1.png",
		},
	]);
</script>

<nav aria-label="Navegação do perfil">
	<ul class="tablist mt">
		{#each tabs as tab (tab.id)}
			<li data-selected={tab.id === selectedTab}>
				<a href={tab.href} aria-current={tab.id === selectedTab ? "page" : undefined}>
					<img src={tab.icon} alt="" aria-hidden="true" />
					{tab.label}
				</a>
			</li>
		{/each}
	</ul>
</nav>

<div class="window">
	<div class="window-body">
		{@render children?.()}
	</div>
</div>
