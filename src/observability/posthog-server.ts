import { PostHog } from "posthog-node";
import { POSTHOG_KEY } from "astro:env/client";
import { POSTHOG_HOST } from "astro:env/server";

export const posthogServer = new PostHog(POSTHOG_KEY || "", {
	host: POSTHOG_HOST,
	flushAt: 1,
	flushInterval: 0,
});
