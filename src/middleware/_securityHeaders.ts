import { defineMiddleware } from "astro:middleware";

const SECURITY_HEADERS = {
	"X-Frame-Options": "SAMEORIGIN",
	"X-Content-Type-Options": "nosniff",
	"Referrer-Policy": "same-origin",
	"Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",
	"Strict-Transport-Security": "max-age=31536000",
	"Content-Security-Policy": [
		"default-src 'self'",
		"script-src 'self' 'unsafe-inline'",
		"style-src 'self' 'unsafe-inline'",
		"img-src 'self' data: blob: https://utfs.io https://*.utfs.io https://*.ufs.sh",
		"font-src 'self' data:",
		"connect-src 'self'",
		"object-src 'none'",
		"base-uri 'self'",
		"frame-ancestors 'none'",
		"form-action 'self'",
	].join("; "),
} as const;

export const securityHeaders = defineMiddleware(async (_context, next) => {
	const response = await next();

	const headers = new Headers(response.headers);
	for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
		headers.set(name, value);
	}

	return new Response(response.body, {
		status: response.status,
		statusText: response.statusText,
		headers,
	});
});
