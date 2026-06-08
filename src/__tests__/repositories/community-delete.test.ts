// Feature: communities, Property 11: Exclusão autorizada de post ou resposta
// Feature: communities, Property 12: Exclusão de comunidade restrita ao owner
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
	communities: { id: "id", ownerId: "ownerId" },
	communityAdmins: {},
	communitySubscribers: {},
	communityPosts: { id: "id", authorId: "authorId", communityId: "communityId" },
	communityResponses: { id: "id", authorId: "authorId" },
	users: {},
}));
vi.mock("drizzle-orm", async (importOriginal) => {
	const actual = await importOriginal<typeof import("drizzle-orm")>();
	return {
		...actual,
		and: vi.fn((...args) => ({ type: "and", args })),
		eq: vi.fn((col, val) => ({ type: "eq", col, val })),
	};
});

import { communityRepository } from "../../repositories/community";

describe("Property 11: Exclusão autorizada de post ou resposta", () => {
	beforeEach(() => vi.clearAllMocks());

	it("deletePost retorna [] quando requesterId !== authorId", async () => {
		await fc.assert(
			fc.asyncProperty(
				fc.string({ minLength: 1 }),
				fc
					.tuple(fc.string({ minLength: 1 }), fc.string({ minLength: 1 }))
					.filter(([a, b]) => a !== b),
				async (postId, [, requesterId]) => {
					vi.clearAllMocks();
					mockReturning.mockResolvedValue([]);
					const result = await communityRepository.deletePost(postId, requesterId);
					expect(result).toEqual([]);
				},
			),
			{ numRuns: 100 },
		);
	});

	it("deletePost retorna a linha excluída quando requesterId === authorId", async () => {
		await fc.assert(
			fc.asyncProperty(
				fc.string({ minLength: 1 }),
				fc.string({ minLength: 1 }),
				async (postId, authorId) => {
					vi.clearAllMocks();
					const deletedRow = { id: postId, authorId };
					mockReturning.mockResolvedValue([deletedRow]);
					const result = await communityRepository.deletePost(postId, authorId);
					expect(result).toEqual([deletedRow]);
				},
			),
			{ numRuns: 100 },
		);
	});

	it("deleteResponse retorna [] quando requesterId !== authorId", async () => {
		await fc.assert(
			fc.asyncProperty(
				fc.string({ minLength: 1 }),
				fc
					.tuple(fc.string({ minLength: 1 }), fc.string({ minLength: 1 }))
					.filter(([a, b]) => a !== b),
				async (responseId, [, requesterId]) => {
					vi.clearAllMocks();
					mockReturning.mockResolvedValue([]);
					const result = await communityRepository.deleteResponse(responseId, requesterId);
					expect(result).toEqual([]);
				},
			),
			{ numRuns: 100 },
		);
	});

	it("deleteResponse retorna a linha excluída quando requesterId === authorId", async () => {
		await fc.assert(
			fc.asyncProperty(
				fc.string({ minLength: 1 }),
				fc.string({ minLength: 1 }),
				async (responseId, authorId) => {
					vi.clearAllMocks();
					const deletedRow = { id: responseId, authorId };
					mockReturning.mockResolvedValue([deletedRow]);
					const result = await communityRepository.deleteResponse(responseId, authorId);
					expect(result).toEqual([deletedRow]);
				},
			),
			{ numRuns: 100 },
		);
	});
});

describe("Property 12: Exclusão de comunidade restrita ao owner", () => {
	beforeEach(() => vi.clearAllMocks());

	it("deleteCommunity retorna [] quando requesterId !== ownerId", async () => {
		await fc.assert(
			fc.asyncProperty(
				fc.string({ minLength: 1 }),
				fc
					.tuple(fc.string({ minLength: 1 }), fc.string({ minLength: 1 }))
					.filter(([a, b]) => a !== b),
				async (communityId, [, requesterId]) => {
					vi.clearAllMocks();
					mockReturning.mockResolvedValue([]);
					const result = await communityRepository.deleteCommunity(communityId, requesterId);
					expect(result).toEqual([]);
				},
			),
			{ numRuns: 100 },
		);
	});

	it("deleteCommunity retorna a linha excluída quando requesterId === ownerId", async () => {
		await fc.assert(
			fc.asyncProperty(
				fc.string({ minLength: 1 }),
				fc.string({ minLength: 1 }),
				async (communityId, ownerId) => {
					vi.clearAllMocks();
					const deletedRow = { id: communityId, ownerId };
					mockReturning.mockResolvedValue([deletedRow]);
					const result = await communityRepository.deleteCommunity(communityId, ownerId);
					expect(result).toEqual([deletedRow]);
				},
			),
			{ numRuns: 100 },
		);
	});
});
