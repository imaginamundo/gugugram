// @vitest-environment jsdom
import { type Component } from "svelte";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";

import ImagePostComponent from "../../components/post/ImagePost/ImagePost.svelte";

const ImagePost = ImagePostComponent as unknown as Component;

vi.mock("../../stores/imagePostModalStore.svelte", () => ({
	imageModalStore: { post: undefined, clear: vi.fn() },
}));

const basePost = {
	id: "post-1",
	image: "/img/pixel.png",
	description: null,
	commentsCount: 0,
	userId: "user-1",
	username: "testuser",
	createdAt: new Date(),
};

describe("ImagePost", () => {
	it("uses description as alt text when present", () => {
		render(ImagePost, { props: { post: { ...basePost, description: "minha foto" } } });
		expect(screen.getByRole("img")).toHaveAttribute("alt", "minha foto");
	});

	it("falls back to 'Foto de <username>' when description is null", () => {
		render(ImagePost, { props: { post: basePost } });
		expect(screen.getByRole("img")).toHaveAttribute("alt", "Foto de testuser");
	});

	it("renders a link to the post page", () => {
		render(ImagePost, { props: { post: basePost } });
		expect(screen.getByRole("link")).toHaveAttribute("href", "/testuser/post-1");
	});

	it("shows comment count badge when commentsCount > 0", () => {
		render(ImagePost, { props: { post: { ...basePost, commentsCount: 3 } } });
		expect(screen.getByText("3")).toBeInTheDocument();
	});

	it("hides comment count badge when commentsCount is 0", () => {
		render(ImagePost, { props: { post: basePost } });
		expect(screen.queryByText("0")).not.toBeInTheDocument();
	});

	it("sets imageModalStore.post on click", async () => {
		const { imageModalStore } = await import("../../stores/imagePostModalStore.svelte");
		const user = userEvent.setup();
		render(ImagePost, { props: { post: basePost } });
		await user.click(screen.getByRole("link"));
		expect(imageModalStore.post).toEqual(basePost);
	});
});
