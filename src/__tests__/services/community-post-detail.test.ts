// Feature: communities — paginated post detail view
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../infra/storage", () => ({
	storage: {
		upload: vi.fn().mockResolvedValue({ data: { ufsUrl: "https://example.com/img.png" } }),
		delete: vi.fn().mockResolvedValue(undefined),
	},
}));

vi.mock("../../repositories/community", () => ({
	communityRepository: {
		getPostWithAuthor: vi.fn(),
		getPostById: vi.fn(),
		getPostWithResponses: vi.fn(),
		countResponsesByPost: vi.fn(),
		getResponsesByPostPaginated: vi.fn(),
	},
}));

import { communityRepository } from "../../repositories/community";
import { getCommunityPostPaginated } from "../../services/community";

const postRow = {
	id: "post-1",
	communityId: "community-1",
	title: "Título",
	content: "Conteúdo",
	authorId: "user-1",
	authorUsername: "autora",
	createdAt: new Date("2026-01-01T00:00:00Z"),
};

function responsePage(size: number) {
	return Array.from({ length: size }, (_, i) => ({
		id: `response-${i}`,
		postId: "post-1",
		content: `resposta ${i}`,
		authorId: "user-2",
		author: { id: "user-2", username: "leitor" },
		createdAt: new Date("2026-01-02T00:00:00Z"),
	}));
}

describe("getCommunityPostPaginated", () => {
	beforeEach(() => vi.clearAllMocks());

	it("carrega o post sem trazer todas as respostas", async () => {
		vi.mocked(communityRepository.getPostWithAuthor).mockResolvedValue(postRow);
		vi.mocked(communityRepository.countResponsesByPost).mockResolvedValue(2000);
		vi.mocked(communityRepository.getResponsesByPostPaginated).mockResolvedValue(responsePage(20));

		const result = await getCommunityPostPaginated("post-1", 1);

		expect(result).not.toBeNull();
		expect(result?.post.responses).toHaveLength(20);
		// The eager loader and the now-redundant existence check must stay unused.
		expect(communityRepository.getPostWithResponses).not.toHaveBeenCalled();
		expect(communityRepository.getPostById).not.toHaveBeenCalled();
	});

	it("usa a contagem total, não o tamanho da página, no responseCount", async () => {
		vi.mocked(communityRepository.getPostWithAuthor).mockResolvedValue(postRow);
		vi.mocked(communityRepository.countResponsesByPost).mockResolvedValue(2000);
		vi.mocked(communityRepository.getResponsesByPostPaginated).mockResolvedValue(responsePage(20));

		const result = await getCommunityPostPaginated("post-1", 2);

		expect(result?.post.responseCount).toBe(2000);
		expect(result?.pagination).toEqual({ page: 2, totalPages: 100, totalCount: 2000 });
		expect(communityRepository.getResponsesByPostPaginated).toHaveBeenCalledWith("post-1", 2, 20);
	});

	it("expõe o autor do post", async () => {
		vi.mocked(communityRepository.getPostWithAuthor).mockResolvedValue(postRow);
		vi.mocked(communityRepository.countResponsesByPost).mockResolvedValue(0);
		vi.mocked(communityRepository.getResponsesByPostPaginated).mockResolvedValue([]);

		const result = await getCommunityPostPaginated("post-1", 1);

		expect(result?.post.authorUsername).toBe("autora");
		expect(result?.post.authorId).toBe("user-1");
		expect(result?.pagination.totalPages).toBe(1);
	});

	it("retorna null quando o post não existe", async () => {
		vi.mocked(communityRepository.getPostWithAuthor).mockResolvedValue(undefined);
		vi.mocked(communityRepository.countResponsesByPost).mockResolvedValue(0);
		vi.mocked(communityRepository.getResponsesByPostPaginated).mockResolvedValue([]);

		expect(await getCommunityPostPaginated("missing", 1)).toBeNull();
	});
});
