import { describe, it, expect } from "vitest";
import * as fc from "fast-check";

import { checkRateLimit } from "../../utils/rate-limit";

const RATE_LIMIT_MS = 5000;

describe("checkRateLimit", () => {
	it("throws with a positive integer when within the window", () => {
		fc.assert(
			fc.property(fc.integer({ min: 1, max: RATE_LIMIT_MS - 1000 }), (timeDiff) => {
				const lastCreatedAt = new Date(Date.now() - timeDiff);

				let thrown: Error | undefined;
				try {
					checkRateLimit(lastCreatedAt, RATE_LIMIT_MS, "Aguarde mais");
				} catch (e) {
					thrown = e as Error;
				}

				expect(thrown).toBeDefined();
				const numbers = thrown!.message.match(/\d+/g)?.map(Number) ?? [];
				expect(numbers.some((n) => Number.isInteger(n) && n >= 1)).toBe(true);
			}),
			{ numRuns: 100 },
		);
	});

	it("does not throw when outside the window", () => {
		fc.assert(
			fc.property(
				fc.integer({ min: RATE_LIMIT_MS + 1000, max: RATE_LIMIT_MS * 10 }),
				(timeDiff) => {
					const lastCreatedAt = new Date(Date.now() - timeDiff);
					expect(() => checkRateLimit(lastCreatedAt, RATE_LIMIT_MS, "Aguarde mais")).not.toThrow();
				},
			),
			{ numRuns: 100 },
		);
	});

	it("does not throw when lastCreatedAt is null or undefined", () => {
		expect(() => checkRateLimit(null, RATE_LIMIT_MS, "Aguarde mais")).not.toThrow();
		expect(() => checkRateLimit(undefined, RATE_LIMIT_MS, "Aguarde mais")).not.toThrow();
	});
});
