import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockCountUsers, mockGetUsernamesPage, mockGetCommunitySlugs, mockGetPosts } = vi.hoisted(
	() => ({
		mockCountUsers: vi.fn(),
		mockGetUsernamesPage: vi.fn(),
		mockGetCommunitySlugs: vi.fn(),
		mockGetPosts: vi.fn(),
	}),
);

vi.mock("../../repositories/sitemap", () => ({
	sitemapRepository: {
		countUsers: mockCountUsers,
		getUsernamesPage: mockGetUsernamesPage,
		getCommunitySlugs: mockGetCommunitySlugs,
		getPosts: mockGetPosts,
	},
}));

import {
	getSitemapUserPageCount,
	getSitemapUsernames,
	getSitemapCommunitySlugs,
	getSitemapPosts,
	SITEMAP_PAGE_SIZE,
	SITEMAP_COMMUNITY_LIMIT,
	SITEMAP_POST_LIMIT,
} from "../../services/sitemap";
import { escapeXml } from "../../utils/xml";

describe("sitemap chunking", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockGetUsernamesPage.mockResolvedValue([]);
		mockGetCommunitySlugs.mockResolvedValue([]);
		mockGetPosts.mockResolvedValue([]);
	});

	it("stays under the 50k-URL sitemap cap", () => {
		expect(SITEMAP_PAGE_SIZE).toBeLessThanOrEqual(50_000);
	});

	it("always reports at least one page", async () => {
		mockCountUsers.mockResolvedValue(0);
		await expect(getSitemapUserPageCount()).resolves.toBe(1);
	});

	it("adds a chunk for the remainder", async () => {
		mockCountUsers.mockResolvedValue(SITEMAP_PAGE_SIZE * 2 + 1);
		await expect(getSitemapUserPageCount()).resolves.toBe(3);
	});

	it("does not add a chunk on an exact multiple", async () => {
		mockCountUsers.mockResolvedValue(SITEMAP_PAGE_SIZE * 2);
		await expect(getSitemapUserPageCount()).resolves.toBe(2);
	});

	it("requests a bounded window offset by whole chunks", async () => {
		await getSitemapUsernames(3);
		expect(mockGetUsernamesPage).toHaveBeenCalledWith(SITEMAP_PAGE_SIZE, SITEMAP_PAGE_SIZE * 2);
	});

	it("caps the community and post lists so one file stays under the URL cap", async () => {
		expect(SITEMAP_COMMUNITY_LIMIT + SITEMAP_POST_LIMIT).toBeLessThanOrEqual(50_000);

		await getSitemapCommunitySlugs();
		expect(mockGetCommunitySlugs).toHaveBeenCalledWith(SITEMAP_COMMUNITY_LIMIT);

		await getSitemapPosts();
		expect(mockGetPosts).toHaveBeenCalledWith(SITEMAP_POST_LIMIT);
	});

	it("escapes characters that would break the XML document", () => {
		expect(escapeXml(`a&b<c>d"e'f`)).toBe("a&amp;b&lt;c&gt;d&quot;e&apos;f");
	});
});
