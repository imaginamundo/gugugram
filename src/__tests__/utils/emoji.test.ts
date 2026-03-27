import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { getEmojiById, emojis } from "../../utils/emoji";

describe("getEmojiById prefix invariant", () => {
	it("always returns a path starting with /emojis/", () => {
		fc.assert(
			fc.property(fc.string({ minLength: 1 }), (id) => {
				expect(getEmojiById(id).startsWith("/emojis/")).toBe(true);
			}),
			{ numRuns: 100 },
		);
	});
});

describe("getEmojiById determinism", () => {
	it("returns the same value for the same input called twice", () => {
		fc.assert(
			fc.property(fc.string({ minLength: 1 }), (id) => {
				expect(getEmojiById(id)).toBe(getEmojiById(id));
			}),
			{ numRuns: 100 },
		);
	});
});

describe("getEmojiById range invariant", () => {
	it("filename portion is always one of the 83 known emoji entries", () => {
		fc.assert(
			fc.property(fc.string({ minLength: 1 }), (id) => {
				const result = getEmojiById(id);
				const filename = result.replace("/emojis/", "");
				expect(emojis).toContain(filename);
			}),
			{ numRuns: 100 },
		);
	});
});
