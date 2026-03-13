import type { APIRoute } from "astro";
import { getImagePostComments } from "@services/image";

export const GET: APIRoute = async ({ params }) => {
	const { postId } = params;

	if (!postId) {
		return new Response(JSON.stringify({ error: "Post ID missing" }), { status: 400 });
	}

	try {
		const comments = await getImagePostComments(postId);

		return new Response(JSON.stringify(comments), {
			headers: { "Content-Type": "application/json" },
		});
	} catch {
		return new Response(JSON.stringify({ error: "Erro ao buscar comentários" }), { status: 500 });
	}
};
