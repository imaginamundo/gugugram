import type { AppTrackingEvent } from "@customTypes/tracking";
import { posthogServer } from "@lib/posthog-server.ts";

interface TrackPayload {
	distinctId: string;
	event: AppTrackingEvent;
	properties?: Record<string, unknown>;
}

export function identifyUserServer({
	distinctId,
	properties,
}: {
	distinctId: string;
	properties?: Record<string, unknown>;
}) {
	try {
		posthogServer.identify({ distinctId, properties });
	} catch (error) {
		console.error("[Tracking Error] Failed to identify user:", error);
	}
}

export function trackServerEvent({ distinctId, event, properties }: TrackPayload) {
	try {
		posthogServer.capture({
			distinctId,
			event,
			properties,
		});
	} catch (error) {
		console.error(`[Tracking Error] Failed to send ${event}:`, error);
	}
}

/**
 * Flushes buffered PostHog events by calling `posthog.shutdown()`.
 * This permanently terminates the PostHog client — call only at the
 * end of a serverless invocation, never in a persistent-server context.
 */
export async function flushServerEvents() {
	try {
		await posthogServer.shutdown();
	} catch (error) {
		console.error("[Tracking Error] Failed to flush events:", error);
	}
}
