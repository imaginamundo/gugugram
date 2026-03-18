import { PostHog } from "posthog-node";
import { POSTHOG_KEY } from "astro:env/client";
import { POSTHOG_HOST } from "astro:env/server";

let posthogClient: PostHog | null = null;

export function getPostHogServer(): PostHog {
	if (!posthogClient) {
		posthogClient = new PostHog(POSTHOG_KEY || "", {
			host: POSTHOG_HOST,
			flushAt: 1,
			flushInterval: 0,
		});
	}
	return posthogClient;
}
