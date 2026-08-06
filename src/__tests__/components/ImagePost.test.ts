// @vitest-environment jsdom
import { type Component } from "svelte";
import { describe, it, expect, afterEach } from "vitest";
import { render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";

import ImagePostComponent from "../../components/post/ImagePost/ImagePost.svelte";
import { delegateImagePostClicks } from "../../components/post/ImagePostList/delegateImagePostClicks";
import { imageModalStore } from "../../stores/imagePostModalStore.svelte";

const ImagePost = ImagePostComponent as unknown as Component;

const basePost = {
	id: "post-1",
	image: "/img/pixel.png",
	description: null as string | null,
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

	it("carries its post id so the delegated listener can find it", () => {
		render(ImagePost, { props: { post: basePost } });
		expect(screen.getByRole("link")).toHaveAttribute("data-post-id", "post-1");
	});

	it("renders no inline click handler — the grid is not hydrated", () => {
		const { container } = render(ImagePost, { props: { post: basePost } });
		expect(container.innerHTML).not.toContain("onclick");
	});
});

describe("delegateImagePostClicks", () => {
	let teardown: () => void;

	function renderGrid(posts: (typeof basePost)[]) {
		for (const post of posts) render(ImagePost, { props: { post } });

		const payload = document.createElement("script");
		payload.type = "application/json";
		payload.setAttribute("data-image-post-payload", "");
		payload.textContent = JSON.stringify(posts);
		document.body.append(payload);

		teardown = delegateImagePostClicks();
	}

	afterEach(() => {
		teardown?.();
		imageModalStore.clear();
		// `cleanup()` only removes what testing-library rendered.
		document.querySelectorAll("script[data-image-post-payload]").forEach((el) => el.remove());
	});

	it("sets imageModalStore.post from the payload on click", async () => {
		const user = userEvent.setup();
		renderGrid([basePost]);

		await user.click(screen.getByRole("link"));

		expect(imageModalStore.post).toEqual(basePost);
	});

	it("resolves the clicked post, not the first one", async () => {
		const other = { ...basePost, id: "post-2", description: "outra foto" };
		const user = userEvent.setup();
		renderGrid([basePost, other]);

		await user.click(screen.getByRole("link", { name: "outra foto" }));

		expect(imageModalStore.post).toEqual(other);
	});

	it("revives createdAt as a Date so the modal can format it", async () => {
		const user = userEvent.setup();
		renderGrid([basePost]);

		await user.click(screen.getByRole("link"));

		expect(imageModalStore.post?.createdAt).toBeInstanceOf(Date);
	});

	it("works for a click on the image inside the link", async () => {
		const user = userEvent.setup();
		renderGrid([basePost]);

		await user.click(screen.getByRole("img"));

		expect(imageModalStore.post).toEqual(basePost);
	});

	it("lets modifier-clicks navigate instead of opening the modal", async () => {
		const user = userEvent.setup();
		renderGrid([basePost]);

		await user.keyboard("{Meta>}");
		await user.click(screen.getByRole("link"));
		await user.keyboard("{/Meta}");

		expect(imageModalStore.post).toBeUndefined();
	});

	it("leaves links alone when the payload is missing", async () => {
		const user = userEvent.setup();
		render(ImagePost, { props: { post: basePost } });
		teardown = delegateImagePostClicks();

		await user.click(screen.getByRole("link"));

		expect(imageModalStore.post).toBeUndefined();
	});

	it("stops listening after teardown", async () => {
		const user = userEvent.setup();
		renderGrid([basePost]);
		teardown();

		await user.click(screen.getByRole("link"));

		expect(imageModalStore.post).toBeUndefined();
	});
});
