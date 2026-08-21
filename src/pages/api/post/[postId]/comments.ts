import type { APIRoute } from "astro";
import { getImagePostComments } from "@services/imagePost";

// Comments are public and identical for every viewer, so the response is safe
// to share. A short TTL keeps a hot post from re-querying on every modal open.
const CACHE_CONTROL = "public, max-age=30, stale-while-revalidate=300";

export const GET: APIRoute = async ({ params, url }) => {
	const { postId } = params;

	if (!postId) {
		return new Response(JSON.stringify({ error: "Post ID missing" }), { status: 400 });
	}

	const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10) || 1);

	try {
		const comments = await getImagePostComments(postId, page);

		return new Response(JSON.stringify(comments), {
			headers: {
				"Content-Type": "application/json",
				"Cache-Control": CACHE_CONTROL,
			},
		});
	} catch {
		return new Response(JSON.stringify({ error: "Erro ao buscar comentários" }), { status: 500 });
	}
};
