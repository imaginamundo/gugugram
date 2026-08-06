import type { APIRoute } from "astro";
import { getSitemapCommunitySlugs, getSitemapPosts } from "@services/sitemap";
import { escapeXml } from "@utils/xml";

const CACHE_CONTROL = "public, max-age=21600";

const urlBlock = (
	site: string | URL | undefined,
	path: string,
	changefreq: string,
	priority: string,
) => `
    <url>
      <loc>${escapeXml(`${site}${path}`)}</loc>
      <changefreq>${changefreq}</changefreq>
      <priority>${priority}</priority>
    </url>
  `;

export const GET: APIRoute = async ({ site }) => {
	// Both lists are capped in the service layer. Communities and posts are the
	// two tables that grow without an upper bound, and a sitemap file may not
	// exceed 50,000 URLs anyway.
	const [communitySlugs, posts] = await Promise.all([
		getSitemapCommunitySlugs(),
		getSitemapPosts(),
	]);

	const communityUrls = communitySlugs
		.map((slug) => urlBlock(site, `comunidades/${slug}`, "weekly", "0.8"))
		.join("");

	const postUrls = posts
		.map((post) => urlBlock(site, `${post.username}/${post.id}`, "monthly", "0.5"))
		.join("");

	const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${communityUrls}${postUrls}
    </urlset>`;

	return new Response(sitemap, {
		headers: {
			"Content-Type": "application/xml",
			"Cache-Control": CACHE_CONTROL,
		},
	});
};
