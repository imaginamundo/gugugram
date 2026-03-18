import type { AppTrackingEvent } from "@customTypes/tracking.ts";
import posthog from "posthog-js";
import { POSTHOG_KEY } from "astro:env/client";

declare global {
	interface Window {
		posthog?: {
			capture: (event: string, properties?: Record<string, unknown>) => void;
			identify: (distinctId: string, properties?: Record<string, unknown>) => void;
			reset: () => void;
		};
	}
}

export function initTracking() {
	if (typeof window !== "undefined" && !posthog.__loaded) {
		posthog.init(POSTHOG_KEY, {
			api_host: "/ingest",
			ui_host: "https://us.posthog.com",
			disable_session_recording: false,
		});
	}
}

export function trackEvent(eventName: AppTrackingEvent, properties?: Record<string, unknown>) {
	if (typeof window !== "undefined" && window.posthog) {
		window.posthog.capture(eventName, properties);
	}
}

export function identifyUser(distinctId: string, properties?: Record<string, unknown>) {
	if (typeof window !== "undefined" && window.posthog) {
		window.posthog.identify(distinctId, properties);
	}
}

export function resetTracking() {
	if (typeof window !== "undefined" && window.posthog) {
		window.posthog.reset();
	}
}
