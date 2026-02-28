import * as Sentry from "@sentry/astro";

Sentry.init({
	dsn: "https://3ca9b653c338ede2463a0f26195ef7af@o4507183498199040.ingest.us.sentry.io/4507339776000000",
	// Adds request headers and IP for users, for more info visit:
	// https://docs.sentry.io/platforms/javascript/guides/astro/configuration/options/#sendDefaultPii
	sendDefaultPii: true,
});
