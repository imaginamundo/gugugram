import { defineMiddleware } from "astro:middleware";
import * as Sentry from "@sentry/astro";
import { auth } from "@lib/auth.ts";

export const protectedRoutes = defineMiddleware(async (context, next) => {
	const session = await auth.api.getSession({ headers: context.request.headers });

	if (session?.user) {
		Sentry.setUser({
			id: session.user.id,
			username: session.user.username!,
		});
	} else {
		Sentry.setUser(null);
	}

	return next();
});
