import { describe, it, expect, vi, beforeEach } from "vitest";
import * as fc from "fast-check";

const { mockPosthog } = vi.hoisted(() => {
	const mockPosthog = {
		init: vi.fn(),
		__loaded: false,
	};
	return { mockPosthog };
});

vi.mock("posthog-js", () => ({
	default: mockPosthog,
}));

import { initTracking } from "../../utils/tracking";

describe("initTracking uses the provided key", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.stubGlobal("window", {});
		mockPosthog.__loaded = false;
	});

	it("calls posthog.init with the exact key passed as argument", async () => {
		await fc.assert(
			fc.asyncProperty(fc.string({ minLength: 1 }), async (posthogKey) => {
				vi.clearAllMocks();
				mockPosthog.__loaded = false;

				initTracking(posthogKey);

				expect(mockPosthog.init).toHaveBeenCalledWith(posthogKey, expect.any(Object));
			}),
			{ numRuns: 100 },
		);
	});
});
