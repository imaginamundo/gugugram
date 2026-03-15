import type { AppTrackingEvent } from "@customTypes/tracking";
import { getPostHogServer } from "@lib/posthog-server.ts";

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
		getPostHogServer().identify({ distinctId, properties });
	} catch (error) {
		console.error("[Tracking Error] Failed to identify user:", error);
	}
}

export function trackServerEvent({ distinctId, event, properties }: TrackPayload) {
	try {
		const posthog = getPostHogServer();
		posthog.capture({
			distinctId,
			event,
			properties,
		});
	} catch (error) {
		console.error(`[Tracking Error] Failed to send ${event}:`, error);
	}
}

export async function flushServerEvents() {
	try {
		const posthog = getPostHogServer();
		await posthog.shutdown();
	} catch (error) {
		console.error("[Tracking Error] Failed to flush events:", error);
	}
}
