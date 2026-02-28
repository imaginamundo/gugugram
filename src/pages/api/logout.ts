import type { APIRoute } from "astro";
import { auth } from "@auth/auth";

export const GET: APIRoute = async (context) => {
	try {
		await auth.api.signOut({
			headers: context.request.headers,
		});

		return context.redirect("/");
	} catch (error) {
		console.log(error);
		return new Response("Erro ao sair", { status: 500 });
	}
};
