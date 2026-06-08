// Feature: communities, Property 1: Sanitização de título e descrição na criação de comunidade
// Feature: communities, Property 7: Sanitização de título e conteúdo do post
// Feature: communities, Property 10: Sanitização do conteúdo da resposta
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
		getCommunityBySlug: vi.fn(),
		getCommunityById: vi.fn(),
		insertCommunity: vi.fn().mockResolvedValue(undefined),
		insertSubscriber: vi.fn().mockResolvedValue(undefined),
		getSubscriber: vi.fn().mockResolvedValue(null),
		insertPost: vi.fn().mockResolvedValue(undefined),
		getPostsByCommunity: vi.fn().mockResolvedValue([{ id: "post-1" }]),
		getPostById: vi.fn(),
		insertResponse: vi.fn().mockResolvedValue(undefined),
	},
}));

import { communityRepository } from "../../repositories/community";
import { createCommunity, createPost, createResponse } from "../../services/community";

const htmlSnippetArb = fc.oneof(
	fc.constant("<script>alert(1)</script>"),
	fc.constant("<b>bold</b>"),
	fc.constant("<img src=x onerror=alert(1)>"),
	fc.constant("<a href='javascript:void(0)'>click</a>"),
	fc.constant("<h1>title</h1>"),
);

const textWithHtmlArb = fc
	.tuple(fc.string(), htmlSnippetArb, fc.string())
	.map(([prefix, html, suffix]) => prefix + html + suffix);

const validTitleArb = fc.string({ minLength: 3, maxLength: 100 });
const validPostTitleArb = fc.string({ minLength: 3, maxLength: 150 });
const validContentArb = fc.string({ minLength: 1, maxLength: 5000 });

describe("Property 1: Sanitização de título e descrição na criação de comunidade", () => {
	beforeEach(() => vi.clearAllMocks());

	it("título persistido não contém tags HTML", async () => {
		await fc.assert(
			fc.asyncProperty(textWithHtmlArb, async (dirtyTitle) => {
				vi.clearAllMocks();
				// Ensure title length is valid (3-100)
				const title = dirtyTitle.slice(0, 100).padEnd(3, "x");
				(communityRepository.getCommunityBySlug as ReturnType<typeof vi.fn>).mockResolvedValue(
					undefined,
				);
				(communityRepository.getCommunityById as ReturnType<typeof vi.fn>).mockResolvedValue(
					undefined,
				);
				(communityRepository.insertCommunity as ReturnType<typeof vi.fn>).mockResolvedValue(
					undefined,
				);
				(communityRepository.getCommunityBySlug as ReturnType<typeof vi.fn>)
					.mockResolvedValueOnce(undefined)
					.mockResolvedValueOnce({ id: "c-1", slug: "slug" });
				(communityRepository.insertSubscriber as ReturnType<typeof vi.fn>).mockResolvedValue(
					undefined,
				);

				try {
					await createCommunity("user-1", title, null, null);
				} catch {
					return; // validation errors are acceptable
				}

				const calls = (communityRepository.insertCommunity as ReturnType<typeof vi.fn>).mock.calls;
				if (calls.length === 0) return;
				const persistedTitle: string = calls[0][1];
				expect(persistedTitle).not.toContain("<");
				expect(persistedTitle).not.toContain(">");
			}),
			{ numRuns: 100 },
		);
	});

	it("descrição persistida não contém tags HTML", async () => {
		await fc.assert(
			fc.asyncProperty(validTitleArb, textWithHtmlArb, async (title, dirtyDesc) => {
				vi.clearAllMocks();
				const description = dirtyDesc.slice(0, 500);
				(communityRepository.getCommunityBySlug as ReturnType<typeof vi.fn>)
					.mockResolvedValueOnce(undefined)
					.mockResolvedValueOnce({ id: "c-1", slug: "slug" });
				(communityRepository.insertCommunity as ReturnType<typeof vi.fn>).mockResolvedValue(
					undefined,
				);
				(communityRepository.insertSubscriber as ReturnType<typeof vi.fn>).mockResolvedValue(
					undefined,
				);

				try {
					await createCommunity("user-1", title, description, null);
				} catch {
					return;
				}

				const calls = (communityRepository.insertCommunity as ReturnType<typeof vi.fn>).mock.calls;
				if (calls.length === 0) return;
				const persistedDesc: string | null = calls[0][3];
				if (persistedDesc !== null) {
					expect(persistedDesc).not.toContain("<");
					expect(persistedDesc).not.toContain(">");
				}
			}),
			{ numRuns: 100 },
		);
	});
});

describe("Property 7: Sanitização de título e conteúdo do post", () => {
	beforeEach(() => vi.clearAllMocks());

	it("título do post persistido não contém tags HTML", async () => {
		await fc.assert(
			fc.asyncProperty(textWithHtmlArb, validContentArb, async (dirtyTitle, content) => {
				vi.clearAllMocks();
				const title = dirtyTitle.slice(0, 150).padEnd(3, "x");
				(communityRepository.getCommunityById as ReturnType<typeof vi.fn>).mockResolvedValue({
					id: "c-1",
					ownerId: "owner",
				});
				(communityRepository.getSubscriber as ReturnType<typeof vi.fn>).mockResolvedValue({
					id: "sub-1",
				});
				(communityRepository.insertPost as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
				(communityRepository.getPostsByCommunity as ReturnType<typeof vi.fn>).mockResolvedValue([
					{ id: "post-1" },
				]);

				try {
					await createPost("user-1", "c-1", title, content);
				} catch {
					return;
				}

				const calls = (communityRepository.insertPost as ReturnType<typeof vi.fn>).mock.calls;
				if (calls.length === 0) return;
				const persistedTitle: string = calls[0][2];
				expect(persistedTitle).not.toContain("<");
				expect(persistedTitle).not.toContain(">");
			}),
			{ numRuns: 100 },
		);
	});

	it("conteúdo do post persistido não contém tags HTML", async () => {
		await fc.assert(
			fc.asyncProperty(validPostTitleArb, textWithHtmlArb, async (title, dirtyContent) => {
				vi.clearAllMocks();
				const content = dirtyContent.slice(0, 5000).padEnd(1, "x");
				(communityRepository.getCommunityById as ReturnType<typeof vi.fn>).mockResolvedValue({
					id: "c-1",
					ownerId: "owner",
				});
				(communityRepository.getSubscriber as ReturnType<typeof vi.fn>).mockResolvedValue({
					id: "sub-1",
				});
				(communityRepository.insertPost as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
				(communityRepository.getPostsByCommunity as ReturnType<typeof vi.fn>).mockResolvedValue([
					{ id: "post-1" },
				]);

				try {
					await createPost("user-1", "c-1", title, content);
				} catch {
					return;
				}

				const calls = (communityRepository.insertPost as ReturnType<typeof vi.fn>).mock.calls;
				if (calls.length === 0) return;
				const persistedContent: string = calls[0][3];
				expect(persistedContent).not.toContain("<");
				expect(persistedContent).not.toContain(">");
			}),
			{ numRuns: 100 },
		);
	});
});

describe("Property 10: Sanitização do conteúdo da resposta", () => {
	beforeEach(() => vi.clearAllMocks());

	it("conteúdo da resposta persistido não contém tags HTML", async () => {
		await fc.assert(
			fc.asyncProperty(textWithHtmlArb, async (dirtyContent) => {
				vi.clearAllMocks();
				const content = dirtyContent.slice(0, 2000).padEnd(1, "x");
				(communityRepository.getPostById as ReturnType<typeof vi.fn>).mockResolvedValue({
					id: "post-1",
					communityId: "c-1",
				});
				(communityRepository.getSubscriber as ReturnType<typeof vi.fn>).mockResolvedValue({
					id: "sub-1",
				});
				(communityRepository.insertResponse as ReturnType<typeof vi.fn>).mockResolvedValue(
					undefined,
				);

				try {
					await createResponse("user-1", "post-1", content);
				} catch {
					return;
				}

				const calls = (communityRepository.insertResponse as ReturnType<typeof vi.fn>).mock.calls;
				if (calls.length === 0) return;
				const persistedContent: string = calls[0][2];
				expect(persistedContent).not.toContain("<");
				expect(persistedContent).not.toContain(">");
			}),
			{ numRuns: 100 },
		);
	});
});
