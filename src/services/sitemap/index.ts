import { sitemapRepository } from "@repositories/sitemap";

/**
 * The sitemap protocol caps a single file at 50,000 URLs / 50MB, so the user
 * list is served in chunks behind a sitemap index instead of one unbounded
 * query. 45,000 leaves headroom under the cap.
 */
export const SITEMAP_PAGE_SIZE = 45_000;

export async function getSitemapUserPageCount() {
	const totalUsers = await sitemapRepository.countUsers();
	return Math.max(1, Math.ceil(totalUsers / SITEMAP_PAGE_SIZE));
}

export async function getSitemapUsernames(page: number) {
	const rows = await sitemapRepository.getUsernamesPage(
		SITEMAP_PAGE_SIZE,
		(page - 1) * SITEMAP_PAGE_SIZE,
	);
	return rows.map((row) => row.username);
}
