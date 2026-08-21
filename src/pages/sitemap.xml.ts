import type { APIRoute } from "astro";
import { getSitemapUserPageCount } from "@services/sitemap";
import { escapeXml } from "@utils/xml";

// A user list barely changes by the hour, and crawlers re-fetch the index far
// more often than it moves.
const CACHE_CONTROL = "public, max-age=21600";

export const GET: APIRoute = async ({ site }) => {
	const userPageCount = await getSitemapUserPageCount();

	const sitemaps = [
		"sitemap-pages.xml",
		"sitemap-content.xml",
		...Array.from({ length: userPageCount }, (_, i) => `sitemap-users-${i + 1}.xml`),
	];

	const entries = sitemaps
		.map(
			(path) => `
    <sitemap>
      <loc>${escapeXml(`${site}${path}`)}</loc>
    </sitemap>
  `,
		)
		.join("");

	const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
    <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${entries}
    </sitemapindex>`;

	return new Response(sitemapIndex, {
		headers: {
			"Content-Type": "application/xml",
			"Cache-Control": CACHE_CONTROL,
		},
	});
};
