import * as Sentry from "@sentry/astro";
import { SENTRY_DSN } from "astro:env/client";

Sentry.init({
	dsn: SENTRY_DSN,
	integrations: [Sentry.browserTracingIntegration(), Sentry.replayIntegration()],
	tunnel: "/api/log/sentry",
	tracesSampleRate: 0.1,
	replaysSessionSampleRate: 0.1,
	replaysOnErrorSampleRate: 1.0,
  ignoreErrors: [
    // https://trackjs.com/javascript-errors/object-not-found-matching-id-methodname-paramcount/
    /Object Not Found Matching Id:\d+, MethodName:\w+, ParamCount:\d+/
  ],
});
