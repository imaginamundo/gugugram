// Feature: architecture-review, Property 1: Self-friendship throws the typed error constant
import { describe, it, expect, vi, beforeEach } from "vitest";
import * as fc from "fast-check";

vi.mock("../../repositories/userFriends", () => ({
	userFriendsRepository: {
		getReverseRequest: vi.fn(() => new Promise(() => {})),
		getUserWithFriendships: vi.fn(),
		acceptRequestById: vi.fn(),
		createPendingRequest: vi.fn(),
		acceptRequestByUsers: vi.fn(),
		deleteFriendshipBetweenUsers: vi.fn(),
	},
}));

import { processFriendRequest } from "../../services/user/friends";
import { FriendshipErrors } from "../../types/errors";

async function captureError(fn: () => Promise<unknown>): Promise<Error> {
	try {
		await fn();
	} catch (e) {
		expect(e instanceof Error).toBe(true);
		return e as Error;
	}
	throw new Error("Expected function to throw but it did not");
}

describe("Property 1: Self-friendship throws the typed error constant", () => {
	beforeEach(() => vi.clearAllMocks());

	it("processFriendRequest(userId, userId) throws FriendshipErrors.INVALID_ACTION", async () => {
		await fc.assert(
			fc.asyncProperty(fc.string({ minLength: 1 }), async (userId) => {
				vi.clearAllMocks();
				const error = await captureError(() => processFriendRequest(userId, userId));
				expect(error.message).toBe(FriendshipErrors.INVALID_ACTION);
			}),
			{ numRuns: 100 },
		);
	});
});
