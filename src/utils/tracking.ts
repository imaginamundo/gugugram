import type { AppTrackingEvent } from "@customTypes/tracking.ts";

declare global {
	interface Window {
		posthog?: {
			capture: (event: string, properties?: Record<string, unknown>) => void;
			identify: (distinctId: string, properties?: Record<string, unknown>) => void;
			reset: () => void;
		};
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
