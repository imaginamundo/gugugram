import type { AppTrackingEvent } from "@customTypes/tracking";
import { posthogServer } from "@observability/posthog-server.ts";

interface TrackPayload {
	distinctId: string;
	event: AppTrackingEvent;
	properties?: Record<string, unknown>;
}

type VercelRequestContext = { waitUntil?: (promise: Promise<unknown>) => void };
type VercelRequestContextGlobal = Record<
	symbol,
	{ get?: () => VercelRequestContext | undefined } | undefined
>;

/**
 * Vercel publishes the current invocation's `waitUntil` on this well-known
 * global symbol — the same contract `@vercel/functions` reads. Looking it up
 * directly keeps that package out of our dependency list; outside a Vercel
 * request (dev server, tests) the lookup simply yields `undefined`.
 */
const VERCEL_REQUEST_CONTEXT = Symbol.for("@vercel/request-context");

function getWaitUntil() {
	const store = (globalThis as unknown as VercelRequestContextGlobal)[VERCEL_REQUEST_CONTEXT];
	return store?.get?.()?.waitUntil;
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
 * Hands PostHog's buffered events off to the platform without blocking the
 * response.
 *
 * Deliberately does *not* call `posthogServer.shutdown()`. The client is a
 * module-scope singleton and Vercel reuses a warm lambda across requests, so
 * shutting it down after the first mutation would leave every later request on
 * that instance silently dropping its events. `flush()` drains the queue and
 * leaves the client usable.
 *
 * Callers must not `await` this. On Vercel the flush is registered with
 * `waitUntil`, which keeps the invocation alive until it settles; elsewhere it
 * runs in the background. Either way the user's response is never held up by a
 * round-trip to PostHog.
 */
export function flushServerEvents() {
	try {
		const flushed = posthogServer.flush().catch((error) => {
			console.error("[Tracking Error] Failed to flush events:", error);
		});
		getWaitUntil()?.(flushed);
	} catch (error) {
		console.error("[Tracking Error] Failed to flush events:", error);
	}
}
