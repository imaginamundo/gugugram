// @vitest-environment jsdom
import { type Component } from "svelte";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/svelte";
import { createRawSnippet } from "svelte";

import ProfileTabsComponent from "../../components/profile/ProfileTabs/ProfileTabs.svelte";

const ProfileTabs = ProfileTabsComponent as unknown as Component;

const baseProps = {
	selectedTab: "fotos" as const,
	username: "testuser",
	messagesCount: 0,
	unreadMessagesCount: 0,
	friendsCount: 0,
	pendingFriendRequest: 0,
	children: createRawSnippet(() => ({ render: () => "<div>content</div>" })),
};

describe("ProfileTabs", () => {
	// The "comunidades" tab is currently commented out in ProfileTabs.svelte
	// (commit "Comment profile communities"), so it is not asserted here.
	it("renders the three active tab links", () => {
		render(ProfileTabs, { props: baseProps });
		expect(screen.getByRole("link", { name: /fotos/i })).toBeInTheDocument();
		expect(screen.getByRole("link", { name: /recados/i })).toBeInTheDocument();
		expect(screen.getByRole("link", { name: /amigos/i })).toBeInTheDocument();
		expect(screen.queryByRole("link", { name: /comunidades/i })).not.toBeInTheDocument();
	});

	it("marks the selected tab with aria-current=page", () => {
		render(ProfileTabs, { props: { ...baseProps, selectedTab: "recados" } });
		expect(screen.getByRole("link", { name: /recados/i })).toHaveAttribute("aria-current", "page");
		expect(screen.getByRole("link", { name: /fotos/i })).not.toHaveAttribute("aria-current");
	});

	it("shows message count in the recados tab label", () => {
		render(ProfileTabs, { props: { ...baseProps, messagesCount: 5 } });
		expect(screen.getByRole("link", { name: /5 recados/i })).toBeInTheDocument();
	});

	it("shows 'novos' in recados label when unreadMessagesCount > 0", () => {
		render(ProfileTabs, { props: { ...baseProps, messagesCount: 3, unreadMessagesCount: 2 } });
		expect(screen.getByRole("link", { name: /novos/i })).toBeInTheDocument();
	});

	it("does not show 'novos' in recados label when unreadMessagesCount is 0", () => {
		render(ProfileTabs, { props: { ...baseProps, messagesCount: 3, unreadMessagesCount: 0 } });
		expect(screen.queryByText(/novos/i)).not.toBeInTheDocument();
	});

	it("shows friend count in the amigos tab label", () => {
		render(ProfileTabs, { props: { ...baseProps, friendsCount: 7 } });
		expect(screen.getByRole("link", { name: /7 amigos/i })).toBeInTheDocument();
	});

	it("links point to the correct profile paths", () => {
		render(ProfileTabs, { props: baseProps });
		expect(screen.getByRole("link", { name: /fotos/i })).toHaveAttribute("href", "/testuser");
		expect(screen.getByRole("link", { name: /recados/i })).toHaveAttribute(
			"href",
			"/testuser/recados",
		);
		expect(screen.getByRole("link", { name: /amigos/i })).toHaveAttribute(
			"href",
			"/testuser/amigos",
		);
	});
});
