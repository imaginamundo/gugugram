import * as Sentry from "@sentry/astro";
import { SENTRY_DSN } from "astro:env/client";

Sentry.init({
	dsn: SENTRY_DSN,
	tracesSampleRate: 1.0,
});
