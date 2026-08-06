import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockGetCommentsByPostId, mockCountCommentsByPostId } = vi.hoisted(() => ({
	mockGetCommentsByPostId: vi.fn(),
	mockCountCommentsByPostId: vi.fn(),
}));

vi.mock("../../repositories/imagePost.ts", () => ({
	imagePostRepository: {
		getCommentsByPostId: mockGetCommentsByPostId,
		countCommentsByPostId: mockCountCommentsByPostId,
	},
}));

import { getImagePostComments, COMMENTS_PAGE_SIZE } from "../../services/imagePost";

const comment = (id: string) => ({
	id,
	body: "oi",
	createdAt: new Date("2026-01-01"),
	author: { id: "u1", username: "someone" },
});

describe("getImagePostComments: pagination bounds", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockGetCommentsByPostId.mockResolvedValue([]);
		mockCountCommentsByPostId.mockResolvedValue(0);
	});

	it("always requests a bounded window", async () => {
		await getImagePostComments("post-1");
		expect(mockGetCommentsByPostId).toHaveBeenCalledWith("post-1", COMMENTS_PAGE_SIZE, 0);
	});

	it("offsets by whole pages", async () => {
		await getImagePostComments("post-1", 4);
		expect(mockGetCommentsByPostId).toHaveBeenCalledWith(
			"post-1",
			COMMENTS_PAGE_SIZE,
			COMMENTS_PAGE_SIZE * 3,
		);
	});

	it("clamps non-positive pages to the first page", async () => {
		await getImagePostComments("post-1", 0);
		expect(mockGetCommentsByPostId).toHaveBeenCalledWith("post-1", COMMENTS_PAGE_SIZE, 0);
	});

	it("reports the full total, not the size of the returned page", async () => {
		mockCountCommentsByPostId.mockResolvedValue(COMMENTS_PAGE_SIZE * 2 + 1);
		mockGetCommentsByPostId.mockResolvedValue([comment("c1")]);

		const result = await getImagePostComments("post-1");

		expect(result.items).toHaveLength(1);
		expect(result.pagination).toEqual({
			page: 1,
			totalPages: 3,
			totalCount: COMMENTS_PAGE_SIZE * 2 + 1,
		});
	});

	it("reports at least one page when there are no comments", async () => {
		const result = await getImagePostComments("post-1");
		expect(result.pagination).toEqual({ page: 1, totalPages: 1, totalCount: 0 });
	});

	it("flattens the author onto each comment", async () => {
		mockCountCommentsByPostId.mockResolvedValue(1);
		mockGetCommentsByPostId.mockResolvedValue([comment("c1")]);

		const { items } = await getImagePostComments("post-1");

		expect(items[0]).toEqual({
			id: "c1",
			body: "oi",
			createdAt: new Date("2026-01-01"),
			authorId: "u1",
			authorUsername: "someone",
		});
	});
});
