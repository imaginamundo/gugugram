import type { APIRoute } from "astro";
import { SENTRY_DSN } from "astro:env/client";

export const POST: APIRoute = async ({ request }) => {
	try {
		const envelope = await request.text();

		const header = JSON.parse(envelope.split("\n")[0]);

		if (header.dsn !== SENTRY_DSN) {
			return new Response("Invalid DSN", { status: 403 });
		}

		const dsnUrl = new URL(SENTRY_DSN);
		const projectId = dsnUrl.pathname.replace(/^\//, "");
		const host = dsnUrl.hostname;

		const ingestUrl = `https://${host}/api/${projectId}/envelope/`;

		const sentryResponse = await fetch(ingestUrl, {
			method: "POST",
			body: envelope,
			headers: {
				"Content-Type": "application/x-sentry-envelope",
			},
		});

		return new Response(null, { status: sentryResponse.status });
	} catch (error) {
		console.error("Sentry tunnel error:", error);
		return new Response("Tunnel Error", { status: 500 });
	}
};
