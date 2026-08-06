import type { APIRoute } from "astro";
import { getSitemapUsernames } from "@services/sitemap";
import { escapeXml } from "@utils/xml";

const CACHE_CONTROL = "public, max-age=21600";

export const GET: APIRoute = async ({ params, site }) => {
	const page = Number(params.page);

	if (!Number.isInteger(page) || page < 1) {
		return new Response(null, { status: 404 });
	}

	const usernames = await getSitemapUsernames(page);

	// Only the first chunk is allowed to be empty (a brand-new install); beyond
	// that, an out-of-range chunk is not a page of the sitemap.
	if (usernames.length === 0 && page > 1) {
		return new Response(null, { status: 404 });
	}

	const urls = usernames
		.map(
			(username) => `
    <url>
      <loc>${escapeXml(`${site}${username}`)}</loc>
      <changefreq>weekly</changefreq>
      <priority>0.8</priority>
    </url>
  `,
		)
		.join("");

	const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${urls}
    </urlset>`;

	return new Response(sitemap, {
		headers: {
			"Content-Type": "application/xml",
			"Cache-Control": CACHE_CONTROL,
		},
	});
};
