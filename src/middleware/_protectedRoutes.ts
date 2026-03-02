import { defineMiddleware } from "astro:middleware";

const routes = ["/editar-perfil"];

export const protectedRoutes = defineMiddleware(async (context, next) => {
	const { pathname } = context.url;

	const isAuthenticated = !!context.locals.user;
	const isProtectedRoute = routes.some((route) => pathname.startsWith(route));

	if (isProtectedRoute && !isAuthenticated) {
		return context.redirect("/entrar");
	}

	return next();
});
