import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { formDataToObject } from "../../utils/validation";

describe("formDataToObject unique-key scalar invariant", () => {
	it("every value is a scalar (not an array) when all keys are distinct", () => {
		fc.assert(
			fc.property(fc.uniqueArray(fc.string({ minLength: 1 }), { minLength: 1 }), (keys) => {
				const formData = new FormData();
				for (const key of keys) {
					formData.append(key, "value");
				}
				const result = formDataToObject(formData);
				for (const value of Object.values(result)) {
					expect(Array.isArray(value)).toBe(false);
				}
			}),
			{ numRuns: 100 },
		);
	});
});

describe("formDataToObject duplicate-key array invariant", () => {
	it("maps a key to an array of length 2 when two values are appended under the same key", () => {
		fc.assert(
			fc.property(
				fc.tuple(fc.string({ minLength: 1 }), fc.string(), fc.string()),
				([key, val1, val2]) => {
					const formData = new FormData();
					formData.append(key, val1);
					formData.append(key, val2);
					const result = formDataToObject(formData);
					expect(Array.isArray(result[key])).toBe(true);
					expect((result[key] as FormDataEntryValue[]).length).toBe(2);
				},
			),
			{ numRuns: 100 },
		);
	});
});

describe("formDataToObject no data loss", () => {
	it("every appended key appears in the returned object", () => {
		fc.assert(
			fc.property(fc.uniqueArray(fc.string({ minLength: 1 }), { minLength: 1 }), (keys) => {
				const formData = new FormData();
				for (const key of keys) {
					formData.append(key, "value");
				}
				const result = formDataToObject(formData);
				for (const key of keys) {
					expect(key in result).toBe(true);
				}
			}),
			{ numRuns: 100 },
		);
	});
});
