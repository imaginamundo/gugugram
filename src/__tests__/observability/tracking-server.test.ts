import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const { mockPosthogServer } = vi.hoisted(() => ({
	mockPosthogServer: {
		identify: vi.fn(),
		capture: vi.fn(),
		flush: vi.fn(),
		shutdown: vi.fn(),
	},
}));

vi.mock("../../observability/posthog-server.ts", () => ({
	posthogServer: mockPosthogServer,
}));

import { flushServerEvents, trackServerEvent } from "../../observability/tracking-server";

const VERCEL_REQUEST_CONTEXT = Symbol.for("@vercel/request-context");

/** Mimics the request context Vercel installs on `globalThis` per invocation. */
function installVercelContext() {
	const waitUntil = vi.fn();
	(globalThis as Record<symbol, unknown>)[VERCEL_REQUEST_CONTEXT] = {
		get: () => ({ waitUntil }),
	};
	return waitUntil;
}

describe("flushServerEvents", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockPosthogServer.flush.mockResolvedValue(undefined);
	});

	afterEach(() => {
		delete (globalThis as Record<symbol, unknown>)[VERCEL_REQUEST_CONTEXT];
		vi.restoreAllMocks();
	});

	it("flushes the queue and never shuts the client down", () => {
		flushServerEvents();

		expect(mockPosthogServer.flush).toHaveBeenCalledTimes(1);
		expect(mockPosthogServer.shutdown).not.toHaveBeenCalled();
	});

	it("leaves the singleton usable across requests on a warm lambda", () => {
		// The regression this guards: `shutdown()` terminated the module-scope
		// client, so every later request on the same instance dropped its events.
		for (let request = 0; request < 3; request++) {
			trackServerEvent({ distinctId: "user-1", event: "message_sent" });
			flushServerEvents();
		}

		expect(mockPosthogServer.capture).toHaveBeenCalledTimes(3);
		expect(mockPosthogServer.flush).toHaveBeenCalledTimes(3);
		expect(mockPosthogServer.shutdown).not.toHaveBeenCalled();
	});

	it("returns without waiting on the flush", () => {
		let settled = false;
		mockPosthogServer.flush.mockReturnValue(
			Promise.resolve().then(() => {
				settled = true;
			}),
		);

		expect(flushServerEvents()).toBeUndefined();
		expect(settled).toBe(false);
	});

	it("hands the flush to Vercel's waitUntil when a request context exists", async () => {
		const waitUntil = installVercelContext();

		flushServerEvents();

		expect(waitUntil).toHaveBeenCalledTimes(1);
		await expect(waitUntil.mock.calls[0][0]).resolves.toBeUndefined();
	});

	it("still flushes when there is no request context", () => {
		flushServerEvents();

		expect(mockPosthogServer.flush).toHaveBeenCalledTimes(1);
	});

	it("swallows a rejected flush instead of surfacing an unhandled rejection", async () => {
		const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
		const waitUntil = installVercelContext();
		mockPosthogServer.flush.mockRejectedValue(new Error("posthog unreachable"));

		expect(() => flushServerEvents()).not.toThrow();

		await expect(waitUntil.mock.calls[0][0]).resolves.toBeUndefined();
		expect(consoleError).toHaveBeenCalledWith(
			"[Tracking Error] Failed to flush events:",
			expect.any(Error),
		);
	});

	it("swallows a synchronous throw from flush", () => {
		const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
		mockPosthogServer.flush.mockImplementation(() => {
			throw new Error("client not initialised");
		});

		expect(() => flushServerEvents()).not.toThrow();
		expect(consoleError).toHaveBeenCalledWith(
			"[Tracking Error] Failed to flush events:",
			expect.any(Error),
		);
	});
});
