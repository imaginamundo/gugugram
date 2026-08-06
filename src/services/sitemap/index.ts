import { sitemapRepository } from "@repositories/sitemap";

/**
 * The sitemap protocol caps a single file at 50,000 URLs / 50MB, so the user
 * list is served in chunks behind a sitemap index instead of one unbounded
 * query. 45,000 leaves headroom under the cap.
 */
export const SITEMAP_PAGE_SIZE = 45_000;

/**
 * Communities and posts share one file, so together they must stay under the
 * same 50,000-URL cap.
 */
export const SITEMAP_COMMUNITY_LIMIT = 20_000;
export const SITEMAP_POST_LIMIT = 20_000;

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

export async function getSitemapCommunitySlugs() {
	const rows = await sitemapRepository.getCommunitySlugs(SITEMAP_COMMUNITY_LIMIT);
	return rows.map((row) => row.slug);
}

export async function getSitemapPosts() {
	return sitemapRepository.getPosts(SITEMAP_POST_LIMIT);
}
