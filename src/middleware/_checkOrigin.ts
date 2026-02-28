import { defineMiddleware } from "astro:middleware";

export const checkOrigin = defineMiddleware(async (context, next) => {
	const request = context.request;

	if (request.method !== "GET" && request.method !== "HEAD") {
		const origin = request.headers.get("origin");

		const allowedOrigins = ["https://www.gugugram.com", "https://gugugram.com"];

		if (import.meta.env.DEV) {
			allowedOrigins.push("http://localhost:4321");
		}

		if (!origin || !allowedOrigins.includes(origin)) {
			return new Response("Cross-site POST form submissions are forbidden.", {
				status: 403,
			});
		}
	}

	return next();
});
