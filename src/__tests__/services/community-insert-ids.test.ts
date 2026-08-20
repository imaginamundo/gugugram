// Feature: communities — the id returned by createCommunity/createPost must be the
// id of the row that was just inserted, never one re-read from an ordered query.
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../infra/storage", () => ({
	storage: {
		upload: vi.fn().mockResolvedValue({ data: { ufsUrl: "https://example.com/img.png" } }),
		delete: vi.fn().mockResolvedValue(undefined),
	},
}));

vi.mock("../../repositories/community", () => ({
	communityRepository: {
		getCommunityBySlug: vi.fn().mockResolvedValue(undefined),
		getCommunityById: vi.fn().mockResolvedValue({ id: "c-1", ownerId: "owner-1" }),
		insertCommunity: vi.fn(),
		insertSubscriber: vi.fn().mockResolvedValue(undefined),
		getSubscriber: vi.fn().mockResolvedValue({ id: "sub-1" }),
		insertPost: vi.fn(),
		getPostsByCommunity: vi.fn(),
	},
}));

import { communityRepository } from "../../repositories/community";
import { createCommunity, createPost } from "../../services/community";
import { CommunityErrors } from "../../types/errors";

const mocked = communityRepository as unknown as Record<string, ReturnType<typeof vi.fn>>;

async function captureError(fn: () => Promise<unknown>): Promise<Error> {
	try {
		await fn();
	} catch (e) {
		expect(e instanceof Error).toBe(true);
		return e as Error;
	}
	throw new Error("Expected function to throw but it did not");
}

describe("createPost returns the inserted post id", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocked.getCommunityById.mockResolvedValue({ id: "c-1", ownerId: "owner-1" });
		mocked.getSubscriber.mockResolvedValue({ id: "sub-1" });
	});

	it("uses the RETURNING id, not the most recently active post", async () => {
		mocked.insertPost.mockResolvedValue([{ id: "the-new-post" }]);
		// getPostsByCommunity orders by last activity — a concurrently answered post
		// sorts ahead of the one we just inserted. It must not be consulted at all.
		mocked.getPostsByCommunity.mockResolvedValue([{ id: "someone-elses-post" }]);

		const result = await createPost("user-1", "c-1", "Um título", "Um conteúdo");

		expect(result.id).toBe("the-new-post");
		expect(communityRepository.getPostsByCommunity).not.toHaveBeenCalled();
	});

	it("throws DB_INSERT_FAILED instead of returning an empty id", async () => {
		mocked.insertPost.mockResolvedValue([]);

		const err = await captureError(() => createPost("user-1", "c-1", "Um título", "Um conteúdo"));

		expect(err.message).toBe(CommunityErrors.DB_INSERT_FAILED);
	});
});

describe("createCommunity returns the inserted community id", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocked.getCommunityBySlug.mockResolvedValue(undefined);
	});

	it("subscribes the owner with the RETURNING id and never re-reads by slug", async () => {
		mocked.insertCommunity.mockResolvedValue([{ id: "the-new-community" }]);

		const result = await createCommunity("owner-1", "Minha comunidade", null, null);

		expect(result.id).toBe("the-new-community");
		expect(communityRepository.insertSubscriber).toHaveBeenCalledWith(
			"the-new-community",
			"owner-1",
		);
		// One lookup only: the duplicate-slug check before the insert.
		expect(communityRepository.getCommunityBySlug).toHaveBeenCalledTimes(1);
	});

	it("throws DB_INSERT_FAILED rather than subscribing to a fabricated id", async () => {
		mocked.insertCommunity.mockResolvedValue([]);

		const err = await captureError(() =>
			createCommunity("owner-1", "Minha comunidade", null, null),
		);

		expect(err.message).toBe(CommunityErrors.DB_INSERT_FAILED);
		expect(communityRepository.insertSubscriber).not.toHaveBeenCalled();
	});
});
