import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockCountUsers, mockGetUsernamesPage } = vi.hoisted(() => ({
	mockCountUsers: vi.fn(),
	mockGetUsernamesPage: vi.fn(),
}));

vi.mock("../../repositories/sitemap", () => ({
	sitemapRepository: {
		countUsers: mockCountUsers,
		getUsernamesPage: mockGetUsernamesPage,
	},
}));

import {
	getSitemapUserPageCount,
	getSitemapUsernames,
	SITEMAP_PAGE_SIZE,
} from "../../services/sitemap";
import { escapeXml } from "../../utils/xml";

describe("sitemap chunking", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockGetUsernamesPage.mockResolvedValue([]);
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

	it("escapes characters that would break the XML document", () => {
		expect(escapeXml(`a&b<c>d"e'f`)).toBe("a&amp;b&lt;c&gt;d&quot;e&apos;f");
	});
});
