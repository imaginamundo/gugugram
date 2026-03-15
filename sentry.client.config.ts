import * as Sentry from "@sentry/astro";
import { SENTRY_DSN } from "astro:env/client";

Sentry.init({
	dsn: SENTRY_DSN,
	integrations: [Sentry.browserTracingIntegration(), Sentry.replayIntegration()],

	tracesSampleRate: 0.1,
	replaysSessionSampleRate: 0.1,
	replaysOnErrorSampleRate: 1.0,
});
