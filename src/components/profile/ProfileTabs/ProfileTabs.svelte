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

	function handleKeydown(event: KeyboardEvent) {
		if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;

		const target = event.currentTarget as HTMLElement;
		const tabList = target.closest('[role="tablist"]');
		if (!tabList) return;

		const allTabs = Array.from(tabList.querySelectorAll('[role="tab"]')) as HTMLElement[];
		const currentIndex = allTabs.indexOf(target);

		let nextIndex = currentIndex;
		if (event.key === "ArrowRight") {
			nextIndex = (currentIndex + 1) % allTabs.length;
		} else if (event.key === "ArrowLeft") {
			nextIndex = (currentIndex - 1 + allTabs.length) % allTabs.length;
		}

		allTabs[nextIndex].focus();
	}
</script>

<ul class="tablist mt" role="tablist" aria-label="Menu de navegação do perfil">
	{#each tabs as tab (tab.id)}
		<li role="presentation" data-selected={tab.id === selectedTab}>
			<a
				href={tab.href}
				role="tab"
				id="tab-{tab.id}"
				aria-selected={tab.id === selectedTab}
				aria-controls="main-panel"
				tabindex={tab.id === selectedTab ? 0 : -1}
				onkeydown={handleKeydown}
			>
				<img src={tab.icon} alt="" aria-hidden="true" />
				{tab.label}
			</a>
		</li>
	{/each}
</ul>

<div class="window" role="tabpanel" id="main-panel" aria-labelledby="tab-{selectedTab}">
	<div class="window-body">
		{@render children?.()}
	</div>
</div>
