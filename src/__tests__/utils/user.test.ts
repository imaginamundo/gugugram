import { describe, it, expect, vi } from "vitest";
import * as fc from "fast-check";

vi.mock("../../utils/emoji", () => ({
	getEmojiById: (id: string) => "emoji-for-" + id,
}));

vi.mock("../../schemas/database", () => ({ friendshipPossibleStatus: [] }));

vi.mock("../../services/user/profile.ts", () => ({}));

import { parseUser } from "../../utils/user";

describe("parseUser passthrough and fallback", () => {
	it("passes through non-null image unchanged", () => {
		fc.assert(
			fc.property(
				fc.record({ id: fc.string({ minLength: 1 }), image: fc.string({ minLength: 1 }) }),
				(user) => {
					const result = parseUser(user);
					expect(result.image).toBe(user.image);
				},
			),
			{ numRuns: 100 },
		);
	});

	it("falls back to mocked getEmojiById when image is null", () => {
		fc.assert(
			fc.property(
				fc.record({ id: fc.string({ minLength: 1 }), image: fc.constant(null) }),
				(user) => {
					const result = parseUser(user);
					expect(result.image).toBe("emoji-for-" + user.id);
				},
			),
			{ numRuns: 100 },
		);
	});
});

describe("parseUser non-destructive", () => {
	it("preserves all fields other than image", () => {
		fc.assert(
			fc.property(
				fc.record({
					id: fc.string({ minLength: 1 }),
					image: fc.option(fc.string({ minLength: 1 }), { nil: null }),
					username: fc.string({ minLength: 1 }),
					displayUsername: fc.string({ minLength: 1 }),
					name: fc.string({ minLength: 1 }),
				}),
				(user) => {
					const result = parseUser(user);
					expect(result.id).toBe(user.id);
					expect(result.username).toBe(user.username);
					expect(result.displayUsername).toBe(user.displayUsername);
					expect(result.name).toBe(user.name);
				},
			),
			{ numRuns: 100 },
		);
	});
});
