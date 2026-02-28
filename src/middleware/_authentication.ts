import { defineMiddleware } from "astro:middleware";
import { auth } from "@auth/auth";

export const authentication = defineMiddleware(async (context, next) => {
	const session = await auth.api.getSession({
		headers: context.request.headers,
	});

	if (session) {
		context.locals.user = session.user;
		context.locals.session = session.session;
	} else {
		context.locals.user = null;
		context.locals.session = null;
	}

	return next();
});
