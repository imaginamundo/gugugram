import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { formatDate } from "../../utils/date";

describe("formatDate output format", () => {
	it("returns a non-empty string matching DD/MM/YY, HH:MM for any valid date", () => {
		fc.assert(
			fc.property(
				fc.date().filter((d) => !isNaN(d.getTime())),
				(date) => {
					const result = formatDate(date);
					expect(result.length).toBeGreaterThan(0);
					expect(result).toMatch(/^\d{2}\/\d{2}\/\d{2}, \d{2}:\d{2}$/);
				},
			),
			{ numRuns: 100 },
		);
	});
});
