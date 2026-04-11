import type { APIRoute } from "astro";
import { auth } from "@auth";
import { posthogServer } from "@observability/posthog-server";

export const POST: APIRoute = async (context) => {
	try {
		const session = context.locals.user;
		await auth.api.signOut({
			headers: context.request.headers,
		});

		if (session) {
			posthogServer.capture({
				distinctId: session.username ?? session.id,
				event: "user_logged_out",
			});
		}

		return context.redirect("/");
	} catch (error) {
		console.log(error);
		return new Response("Erro ao sair", { status: 500 });
	}
};
