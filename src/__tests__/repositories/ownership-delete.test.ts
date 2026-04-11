import { describe, it, expect, vi, beforeEach } from "vitest";
import * as fc from "fast-check";

const { mockReturning, mockDelete } = vi.hoisted(() => {
	const mockReturning = vi.fn();
	const mockWhere = vi.fn(() => ({ returning: mockReturning }));
	const mockDelete = vi.fn(() => ({ where: mockWhere }));
	return { mockReturning, mockDelete };
});

vi.mock("../../infra/database", () => ({ db: { delete: mockDelete } }));
vi.mock("../../schemas/database", () => ({
	imagePosts: { id: "id", authorId: "authorId" },
	imagePostComments: {},
}));
vi.mock("drizzle-orm", async (importOriginal) => {
	const actual = await importOriginal<typeof import("drizzle-orm")>();
	return {
		...actual,
		and: vi.fn((...args) => ({ type: "and", args })),
		eq: vi.fn((col, val) => ({ type: "eq", col, val })),
	};
});

import { imagePostRepository } from "../../repositories/imagePost";

describe("imagePostRepository.deletePost", () => {
	beforeEach(() => vi.clearAllMocks());

	it("returns [] when callerId !== ownerId (ownership mismatch)", async () => {
		await fc.assert(
			fc.asyncProperty(
				fc.string({ minLength: 1 }),
				fc
					.tuple(fc.string({ minLength: 1 }), fc.string({ minLength: 1 }))
					.filter(([a, b]) => a !== b),
				async (postId, [, callerId]) => {
					vi.clearAllMocks();
					mockReturning.mockResolvedValue([]);
					const result = await imagePostRepository.deletePost(postId, callerId);
					expect(result).toEqual([]);
				},
			),
			{ numRuns: 100 },
		);
	});

	it("returns the deleted row when callerId === ownerId", async () => {
		await fc.assert(
			fc.asyncProperty(
				fc.string({ minLength: 1 }),
				fc.string({ minLength: 1 }),
				async (postId, ownerId) => {
					vi.clearAllMocks();
					const deletedRow = { id: postId, authorId: ownerId };
					mockReturning.mockResolvedValue([deletedRow]);
					const result = await imagePostRepository.deletePost(postId, ownerId);
					expect(result).toEqual([deletedRow]);
				},
			),
			{ numRuns: 100 },
		);
	});
});
