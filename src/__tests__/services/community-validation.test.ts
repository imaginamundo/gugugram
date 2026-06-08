// Feature: communities, Property 2: Validação do comprimento do título da comunidade
// Feature: communities, Property 3: Validação do comprimento da descrição da comunidade
// Feature: communities, Property 8: Validação do comprimento do título do post
// Feature: communities, Property 9: Validação do comprimento do conteúdo do post e da resposta
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
		getCommunityBySlug: vi.fn().mockResolvedValue(undefined),
		getCommunityById: vi.fn(),
		insertCommunity: vi.fn().mockResolvedValue(undefined),
		insertSubscriber: vi.fn().mockResolvedValue(undefined),
		getSubscriber: vi.fn().mockResolvedValue({ id: "sub-1" }),
		insertPost: vi.fn().mockResolvedValue(undefined),
		getPostsByCommunity: vi.fn().mockResolvedValue([{ id: "post-1" }]),
		getPostById: vi.fn(),
		insertResponse: vi.fn().mockResolvedValue(undefined),
	},
}));

import { communityRepository } from "../../repositories/community";
import { createCommunity, createPost, createResponse } from "../../services/community";
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

describe("Property 2: Validação do comprimento do título da comunidade", () => {
	beforeEach(() => vi.clearAllMocks());

	it("rejeita título com menos de 3 caracteres", async () => {
		await fc.assert(
			fc.asyncProperty(fc.string({ maxLength: 2 }), async (shortTitle) => {
				vi.clearAllMocks();
				(communityRepository.getCommunityBySlug as ReturnType<typeof vi.fn>).mockResolvedValue(
					undefined,
				);
				const err = await captureError(() => createCommunity("user-1", shortTitle, null, null));
				expect(err.message).toBe(CommunityErrors.TITLE_TOO_SHORT);
			}),
			{ numRuns: 100 },
		);
	});

	it("rejeita título com mais de 100 caracteres", async () => {
		await fc.assert(
			fc.asyncProperty(fc.string({ minLength: 101 }), async (longTitle) => {
				vi.clearAllMocks();
				(communityRepository.getCommunityBySlug as ReturnType<typeof vi.fn>).mockResolvedValue(
					undefined,
				);
				const err = await captureError(() => createCommunity("user-1", longTitle, null, null));
				expect(err.message).toBe(CommunityErrors.TITLE_TOO_LONG);
			}),
			{ numRuns: 100 },
		);
	});

	it("aceita título com comprimento entre 3 e 100 caracteres", async () => {
		await fc.assert(
			fc.asyncProperty(fc.string({ minLength: 3, maxLength: 100 }), async (validTitle) => {
				vi.clearAllMocks();
				(communityRepository.getCommunityBySlug as ReturnType<typeof vi.fn>)
					.mockResolvedValueOnce(undefined)
					.mockResolvedValueOnce({ id: "c-1", slug: "slug" });
				(communityRepository.insertCommunity as ReturnType<typeof vi.fn>).mockResolvedValue(
					undefined,
				);
				(communityRepository.insertSubscriber as ReturnType<typeof vi.fn>).mockResolvedValue(
					undefined,
				);

				await expect(createCommunity("user-1", validTitle, null, null)).resolves.toBeDefined();
			}),
			{ numRuns: 100 },
		);
	});
});

describe("Property 3: Validação do comprimento da descrição da comunidade", () => {
	beforeEach(() => vi.clearAllMocks());

	it("rejeita descrição com mais de 500 caracteres", async () => {
		await fc.assert(
			fc.asyncProperty(
				fc.string({ minLength: 3, maxLength: 100 }),
				fc.string({ minLength: 501 }),
				async (title, longDesc) => {
					vi.clearAllMocks();
					(communityRepository.getCommunityBySlug as ReturnType<typeof vi.fn>).mockResolvedValue(
						undefined,
					);
					const err = await captureError(() => createCommunity("user-1", title, longDesc, null));
					expect(err.message).toBe(CommunityErrors.DESCRIPTION_TOO_LONG);
				},
			),
			{ numRuns: 100 },
		);
	});

	it("aceita descrição com até 500 caracteres", async () => {
		await fc.assert(
			fc.asyncProperty(
				fc.string({ minLength: 3, maxLength: 100 }),
				fc.string({ maxLength: 500 }),
				async (title, validDesc) => {
					vi.clearAllMocks();
					(communityRepository.getCommunityBySlug as ReturnType<typeof vi.fn>)
						.mockResolvedValueOnce(undefined)
						.mockResolvedValueOnce({ id: "c-1", slug: "slug" });
					(communityRepository.insertCommunity as ReturnType<typeof vi.fn>).mockResolvedValue(
						undefined,
					);
					(communityRepository.insertSubscriber as ReturnType<typeof vi.fn>).mockResolvedValue(
						undefined,
					);

					await expect(createCommunity("user-1", title, validDesc, null)).resolves.toBeDefined();
				},
			),
			{ numRuns: 100 },
		);
	});
});

describe("Property 8: Validação do comprimento do título do post", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		(communityRepository.getCommunityById as ReturnType<typeof vi.fn>).mockResolvedValue({
			id: "c-1",
			ownerId: "owner",
		});
		(communityRepository.getSubscriber as ReturnType<typeof vi.fn>).mockResolvedValue({
			id: "sub-1",
		});
	});

	it("rejeita título de post com menos de 3 caracteres", async () => {
		await fc.assert(
			fc.asyncProperty(
				fc.string({ maxLength: 2 }),
				fc.string({ minLength: 1, maxLength: 5000 }),
				async (shortTitle, content) => {
					vi.clearAllMocks();
					(communityRepository.getCommunityById as ReturnType<typeof vi.fn>).mockResolvedValue({
						id: "c-1",
						ownerId: "owner",
					});
					(communityRepository.getSubscriber as ReturnType<typeof vi.fn>).mockResolvedValue({
						id: "sub-1",
					});
					const err = await captureError(() => createPost("user-1", "c-1", shortTitle, content));
					expect(err.message).toBe(CommunityErrors.POST_TITLE_TOO_SHORT);
				},
			),
			{ numRuns: 100 },
		);
	});

	it("rejeita título de post com mais de 150 caracteres", async () => {
		await fc.assert(
			fc.asyncProperty(
				fc.string({ minLength: 151 }),
				fc.string({ minLength: 1, maxLength: 5000 }),
				async (longTitle, content) => {
					vi.clearAllMocks();
					(communityRepository.getCommunityById as ReturnType<typeof vi.fn>).mockResolvedValue({
						id: "c-1",
						ownerId: "owner",
					});
					(communityRepository.getSubscriber as ReturnType<typeof vi.fn>).mockResolvedValue({
						id: "sub-1",
					});
					const err = await captureError(() => createPost("user-1", "c-1", longTitle, content));
					expect(err.message).toBe(CommunityErrors.POST_TITLE_TOO_LONG);
				},
			),
			{ numRuns: 100 },
		);
	});
});

describe("Property 9: Validação do comprimento do conteúdo do post e da resposta", () => {
	beforeEach(() => vi.clearAllMocks());

	it("rejeita conteúdo de post vazio", async () => {
		await fc.assert(
			fc.asyncProperty(fc.string({ minLength: 3, maxLength: 150 }), async (title) => {
				vi.clearAllMocks();
				(communityRepository.getCommunityById as ReturnType<typeof vi.fn>).mockResolvedValue({
					id: "c-1",
					ownerId: "owner",
				});
				(communityRepository.getSubscriber as ReturnType<typeof vi.fn>).mockResolvedValue({
					id: "sub-1",
				});
				const err = await captureError(() => createPost("user-1", "c-1", title, ""));
				expect(err.message).toBe(CommunityErrors.POST_CONTENT_INVALID);
			}),
			{ numRuns: 100 },
		);
	});

	it("rejeita conteúdo de post com mais de 5000 caracteres", async () => {
		await fc.assert(
			fc.asyncProperty(
				fc.string({ minLength: 3, maxLength: 150 }),
				fc.string({ minLength: 5001 }),
				async (title, longContent) => {
					vi.clearAllMocks();
					(communityRepository.getCommunityById as ReturnType<typeof vi.fn>).mockResolvedValue({
						id: "c-1",
						ownerId: "owner",
					});
					(communityRepository.getSubscriber as ReturnType<typeof vi.fn>).mockResolvedValue({
						id: "sub-1",
					});
					const err = await captureError(() => createPost("user-1", "c-1", title, longContent));
					expect(err.message).toBe(CommunityErrors.POST_CONTENT_INVALID);
				},
			),
			{ numRuns: 100 },
		);
	});

	it("rejeita conteúdo de resposta vazio", async () => {
		await fc.assert(
			fc.asyncProperty(fc.string({ minLength: 1 }), async (userId) => {
				vi.clearAllMocks();
				(communityRepository.getPostById as ReturnType<typeof vi.fn>).mockResolvedValue({
					id: "post-1",
					communityId: "c-1",
				});
				(communityRepository.getSubscriber as ReturnType<typeof vi.fn>).mockResolvedValue({
					id: "sub-1",
				});
				const err = await captureError(() => createResponse(userId, "post-1", ""));
				expect(err.message).toBe(CommunityErrors.RESPONSE_CONTENT_INVALID);
			}),
			{ numRuns: 100 },
		);
	});

	it("rejeita conteúdo de resposta com mais de 2000 caracteres", async () => {
		await fc.assert(
			fc.asyncProperty(fc.string({ minLength: 2001 }), async (longContent) => {
				vi.clearAllMocks();
				(communityRepository.getPostById as ReturnType<typeof vi.fn>).mockResolvedValue({
					id: "post-1",
					communityId: "c-1",
				});
				(communityRepository.getSubscriber as ReturnType<typeof vi.fn>).mockResolvedValue({
					id: "sub-1",
				});
				const err = await captureError(() => createResponse("user-1", "post-1", longContent));
				expect(err.message).toBe(CommunityErrors.RESPONSE_CONTENT_INVALID);
			}),
			{ numRuns: 100 },
		);
	});
});
