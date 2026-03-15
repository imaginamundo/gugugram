import { PostHog } from "posthog-node";
import { POSTHOG_HOST, POSTHOG_KEY } from "astro:env/client";

let posthogClient: PostHog | null = null;

/**
 * Get the PostHog server-side client.
 * Uses a singleton pattern to avoid creating multiple clients.
 */
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
