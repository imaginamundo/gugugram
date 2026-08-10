import type { APIRoute } from "astro";
import { getUserUsernames } from "@services/user/profile";
import { getAllCommunitySlugs } from "@services/community";
import { getPostsForSitemap } from "@services/imagePost";

// Top-level pages worth indexing. "" is the homepage.
const STATIC_PAGES = ["", "sobre", "comunidades", "contato", "termos", "privacidade"] as const;

const urlBlock = (
	site: string | URL | undefined,
	path: string,
	changefreq: string,
	priority: string,
) => `
    <url>
      <loc>${site}${path}</loc>
      <changefreq>${changefreq}</changefreq>
      <priority>${priority}</priority>
    </url>
  `;

export const GET: APIRoute = async ({ site }) => {
	const [allUsers, communitySlugs, posts] = await Promise.all([
		getUserUsernames(),
		getAllCommunitySlugs(),
		getPostsForSitemap(1000),
	]);

	const staticUrls = STATIC_PAGES.map((path) =>
		urlBlock(site, path, "daily", path === "" ? "1.0" : "0.8"),
	).join("");

	const userUrls = allUsers.map((user) => urlBlock(site, user.username, "weekly", "0.8")).join("");

	const communityUrls = communitySlugs
		.map((slug) => urlBlock(site, `comunidades/${slug}`, "weekly", "0.8"))
		.join("");

	const postUrls = posts
		.map((post) => urlBlock(site, `${post.username}/${post.id}`, "monthly", "0.5"))
		.join("");

	const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${staticUrls}${userUrls}${communityUrls}${postUrls}
    </urlset>`;

	return new Response(sitemap, {
		headers: {
			"Content-Type": "application/xml",
			"Cache-Control": "public, max-age=3600",
		},
	});
};
