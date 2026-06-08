// Feature: communities, Property 11: Exclusão autorizada de post ou resposta
// Feature: communities, Property 12: Exclusão de comunidade restrita ao owner
// Feature: communities, Property 13: Promoção a admin restrita ao owner
// Feature: communities, Property 15: Transferência de propriedade restrita ao owner
// Feature: communities, Property 19: Não-assinante não pode criar post ou resposta
import { describe, it, expect, vi, beforeEach } from "vitest";
import * as fc from "fast-check";

vi.mock("../../infra/storage", () => ({
	storage: {
		upload: vi.fn().mockResolvedValue({ data: { ufsUrl: "https://example.com/img.png" } }),
		delete: vi.fn().mockResolvedValue(undefined),
	},
}));

vi.mock("../../repositories/community", () => ({
	communityRepository: {
		getCommunityById: vi.fn(),
		getCommunityBySlug: vi.fn(),
		deleteCommunity: vi.fn(),
		getAdmin: vi.fn(),
		insertAdmin: vi.fn().mockResolvedValue(undefined),
		deleteAdmin: vi.fn().mockResolvedValue(undefined),
		updateCommunityOwner: vi.fn().mockResolvedValue(undefined),
		getSubscriber: vi.fn(),
		insertSubscriber: vi.fn().mockResolvedValue(undefined),
		getPostById: vi.fn(),
		deletePost: vi.fn(),
		deletePostAsModerator: vi.fn().mockResolvedValue(undefined),
		getResponseById: vi.fn(),
		deleteResponse: vi.fn(),
		deleteResponseAsModerator: vi.fn().mockResolvedValue(undefined),
		insertPost: vi.fn().mockResolvedValue(undefined),
		getPostsByCommunity: vi.fn().mockResolvedValue([{ id: "post-1" }]),
		insertResponse: vi.fn().mockResolvedValue(undefined),
	},
}));

import { communityRepository } from "../../repositories/community";
import {
	removeCommunity,
	promoteToAdmin,
	removeAdmin,
	transferOwnership,
	removePost,
	removeResponse,
	createPost,
	createResponse,
} from "../../services/community";
import { CommunityErrors } from "../../types/errors";

async function captureError(fn: () => Promise<unknown>): Promise<Error> {
	try {
		await fn();
	} catch (e) {
		expect(e instanceof Error).toBe(true);
		return e as Error;
	}
	throw new Error("Expected function to throw but it did not");
}

const distinctIdsArb = fc
	.tuple(fc.string({ minLength: 1 }), fc.string({ minLength: 1 }))
	.filter(([a, b]) => a !== b);

describe("Property 12: Exclusão de comunidade restrita ao owner", () => {
	beforeEach(() => vi.clearAllMocks());

	it("retorna NOT_OWNER quando requesterId !== ownerId", async () => {
		await fc.assert(
			fc.asyncProperty(
				fc.string({ minLength: 1 }),
				distinctIdsArb,
				async (communityId, [, requesterId]) => {
					vi.clearAllMocks();
					(communityRepository.deleteCommunity as ReturnType<typeof vi.fn>).mockResolvedValue([]);
					const err = await captureError(() => removeCommunity(requesterId, communityId));
					expect(err.message).toBe(CommunityErrors.NOT_OWNER);
				},
			),
			{ numRuns: 100 },
		);
	});
});

describe("Property 13: Promoção a admin restrita ao owner", () => {
	beforeEach(() => vi.clearAllMocks());

	it("promoteToAdmin retorna NOT_OWNER quando solicitante não é owner", async () => {
		await fc.assert(
			fc.asyncProperty(
				fc.string({ minLength: 1 }),
				distinctIdsArb,
				fc.string({ minLength: 1 }),
				async (communityId, [ownerId, requesterId], targetUserId) => {
					vi.clearAllMocks();
					(communityRepository.getCommunityById as ReturnType<typeof vi.fn>).mockResolvedValue({
						id: communityId,
						ownerId,
					});
					const err = await captureError(() =>
						promoteToAdmin(requesterId, communityId, targetUserId),
					);
					expect(err.message).toBe(CommunityErrors.NOT_OWNER);
				},
			),
			{ numRuns: 100 },
		);
	});

	it("removeAdmin retorna NOT_OWNER quando solicitante não é owner", async () => {
		await fc.assert(
			fc.asyncProperty(
				fc.string({ minLength: 1 }),
				distinctIdsArb,
				fc.string({ minLength: 1 }),
				async (communityId, [ownerId, requesterId], targetUserId) => {
					vi.clearAllMocks();
					(communityRepository.getCommunityById as ReturnType<typeof vi.fn>).mockResolvedValue({
						id: communityId,
						ownerId,
					});
					const err = await captureError(() => removeAdmin(requesterId, communityId, targetUserId));
					expect(err.message).toBe(CommunityErrors.NOT_OWNER);
				},
			),
			{ numRuns: 100 },
		);
	});
});

describe("Property 15: Transferência de propriedade restrita ao owner", () => {
	beforeEach(() => vi.clearAllMocks());

	it("transferOwnership retorna NOT_OWNER quando solicitante não é owner", async () => {
		await fc.assert(
			fc.asyncProperty(
				fc.string({ minLength: 1 }),
				distinctIdsArb,
				fc.string({ minLength: 1 }),
				async (communityId, [ownerId, requesterId], newOwnerId) => {
					vi.clearAllMocks();
					(communityRepository.getCommunityById as ReturnType<typeof vi.fn>).mockResolvedValue({
						id: communityId,
						ownerId,
					});
					const err = await captureError(() =>
						transferOwnership(requesterId, communityId, newOwnerId),
					);
					expect(err.message).toBe(CommunityErrors.NOT_OWNER);
				},
			),
			{ numRuns: 100 },
		);
	});
});

describe("Property 11: Exclusão autorizada de post ou resposta", () => {
	beforeEach(() => vi.clearAllMocks());

	it("removePost retorna POST_NOT_AUTHORIZED quando solicitante não é autor nem moderador", async () => {
		await fc.assert(
			fc.asyncProperty(
				fc.string({ minLength: 1 }),
				distinctIdsArb,
				fc.string({ minLength: 1 }),
				async (postId, [authorId, requesterId], communityId) => {
					vi.clearAllMocks();
					(communityRepository.getPostById as ReturnType<typeof vi.fn>).mockResolvedValue({
						id: postId,
						authorId,
						communityId,
					});
					(communityRepository.getCommunityById as ReturnType<typeof vi.fn>).mockResolvedValue({
						id: communityId,
						ownerId: authorId, // requesterId is neither author nor owner
					});
					(communityRepository.getAdmin as ReturnType<typeof vi.fn>).mockResolvedValue(null);
					const err = await captureError(() => removePost(requesterId, postId));
					expect(err.message).toBe(CommunityErrors.POST_NOT_AUTHORIZED);
				},
			),
			{ numRuns: 100 },
		);
	});

	it("removeResponse retorna RESPONSE_NOT_AUTHORIZED quando solicitante não é autor nem moderador", async () => {
		await fc.assert(
			fc.asyncProperty(
				fc.string({ minLength: 1 }),
				distinctIdsArb,
				fc.string({ minLength: 1 }),
				fc.string({ minLength: 1 }),
				async (responseId, [authorId, requesterId], postId, communityId) => {
					vi.clearAllMocks();
					(communityRepository.getResponseById as ReturnType<typeof vi.fn>).mockResolvedValue({
						id: responseId,
						authorId,
						postId,
					});
					(communityRepository.getPostById as ReturnType<typeof vi.fn>).mockResolvedValue({
						id: postId,
						communityId,
					});
					(communityRepository.getCommunityById as ReturnType<typeof vi.fn>).mockResolvedValue({
						id: communityId,
						ownerId: authorId, // requesterId is neither author nor owner
					});
					(communityRepository.getAdmin as ReturnType<typeof vi.fn>).mockResolvedValue(null);
					const err = await captureError(() => removeResponse(requesterId, responseId));
					expect(err.message).toBe(CommunityErrors.RESPONSE_NOT_AUTHORIZED);
				},
			),
			{ numRuns: 100 },
		);
	});
});

describe("Property 19: Não-assinante não pode criar post ou resposta", () => {
	beforeEach(() => vi.clearAllMocks());

	it("createPost retorna NOT_SUBSCRIBER quando usuário não é assinante", async () => {
		await fc.assert(
			fc.asyncProperty(
				fc.string({ minLength: 1 }),
				fc.string({ minLength: 3, maxLength: 150 }),
				fc.string({ minLength: 1, maxLength: 5000 }),
				async (userId, title, content) => {
					vi.clearAllMocks();
					(communityRepository.getCommunityById as ReturnType<typeof vi.fn>).mockResolvedValue({
						id: "c-1",
						ownerId: "owner",
					});
					(communityRepository.getSubscriber as ReturnType<typeof vi.fn>).mockResolvedValue(null);
					const err = await captureError(() => createPost(userId, "c-1", title, content));
					expect(err.message).toBe(CommunityErrors.NOT_SUBSCRIBER);
				},
			),
			{ numRuns: 100 },
		);
	});

	it("createResponse retorna NOT_SUBSCRIBER quando usuário não é assinante", async () => {
		await fc.assert(
			fc.asyncProperty(
				fc.string({ minLength: 1 }),
				fc.string({ minLength: 1, maxLength: 2000 }),
				async (userId, content) => {
					vi.clearAllMocks();
					(communityRepository.getPostById as ReturnType<typeof vi.fn>).mockResolvedValue({
						id: "post-1",
						communityId: "c-1",
					});
					(communityRepository.getSubscriber as ReturnType<typeof vi.fn>).mockResolvedValue(null);
					const err = await captureError(() => createResponse(userId, "post-1", content));
					expect(err.message).toBe(CommunityErrors.NOT_SUBSCRIBER);
				},
			),
			{ numRuns: 100 },
		);
	});
});
