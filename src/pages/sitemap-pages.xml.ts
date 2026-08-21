import type { APIRoute } from "astro";
import { escapeXml } from "@utils/xml";

const CACHE_CONTROL = "public, max-age=21600";

// Top-level pages worth indexing. "" is the homepage. This file touches no
// database at all, so it stays cheap no matter how the site grows.
const STATIC_PAGES = [
	{ path: "", changefreq: "daily", priority: "1.0" },
	{ path: "sobre", changefreq: "daily", priority: "0.8" },
	{ path: "comunidades", changefreq: "daily", priority: "0.8" },
	{ path: "contato", changefreq: "daily", priority: "0.8" },
	{ path: "termos", changefreq: "daily", priority: "0.8" },
	{ path: "privacidade", changefreq: "daily", priority: "0.8" },
];

export const GET: APIRoute = ({ site }) => {
	const urls = STATIC_PAGES.map(
		({ path, changefreq, priority }) => `
    <url>
      <loc>${escapeXml(`${site}${path}`)}</loc>
      <changefreq>${changefreq}</changefreq>
      <priority>${priority}</priority>
    </url>
  `,
	).join("");

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
