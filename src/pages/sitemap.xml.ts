import type { APIRoute } from "astro";
import { db } from "@database/postgres";
import { users } from "@database/schema";

export const GET: APIRoute = async ({ site }) => {
	const allUsers = await db.select({ username: users.username }).from(users);

	const userUrls = allUsers
		.map(
			(user) => `
    <url>
      <loc>${site}/${user.username}</loc>
      <changefreq>weekly</changefreq>
      <priority>0.8</priority>
    </url>
  `,
		)
		.join("");

	const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      <url>
        <loc>${site}</loc>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
      </url>
      ${userUrls}
    </urlset>`;

	return new Response(sitemap, {
		headers: {
			"Content-Type": "application/xml",
			"Cache-Control": "public, max-age=3600",
		},
	});
};
