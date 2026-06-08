// Feature: communities, Property: auth guard — all community actions return { success: false, error: 'Não autenticado.' } when unauthenticated
// Validates: Requirements 1.6, 4.5, 6.4, 7.7, 10.3, 11.4
import { describe, it, expect, vi, beforeEach } from "vitest";
import * as fc from "fast-check";

vi.mock("../../services/community", () => ({
	createCommunity: vi.fn(),
	removeCommunity: vi.fn(),
	promoteToAdmin: vi.fn(),
	removeAdmin: vi.fn(),
	transferOwnership: vi.fn(),
	subscribeToCommunity: vi.fn(),
	unsubscribeFromCommunity: vi.fn(),
	createPost: vi.fn(),
	removePost: vi.fn(),
	createResponse: vi.fn(),
	removeResponse: vi.fn(),
}));

import {
	createCommunity,
	deleteCommunity,
	promoteAdmin,
	removeAdmin,
	transferOwnership,
	subscribe,
	unsubscribe,
	createPost,
	deletePost,
	createResponse,
	deleteResponse,
} from "../../actions/_community";

type ActionConfig = {
	handler: (input: FormData, ctx: unknown) => Promise<{ success: boolean; error?: string }>;
};

function makeUnauthContext() {
	return {
		locals: { user: null, session: null },
		cookies: { set: vi.fn(), get: vi.fn(), delete: vi.fn() },
		request: new Request("http://localhost/", { method: "POST" }),
	};
}

const allActions: Array<[string, ActionConfig]> = [
	["createCommunity", createCommunity as unknown as ActionConfig],
	["deleteCommunity", deleteCommunity as unknown as ActionConfig],
	["promoteAdmin", promoteAdmin as unknown as ActionConfig],
	["removeAdmin", removeAdmin as unknown as ActionConfig],
	["transferOwnership", transferOwnership as unknown as ActionConfig],
	["subscribe", subscribe as unknown as ActionConfig],
	["unsubscribe", unsubscribe as unknown as ActionConfig],
	["createPost", createPost as unknown as ActionConfig],
	["deletePost", deletePost as unknown as ActionConfig],
	["createResponse", createResponse as unknown as ActionConfig],
	["deleteResponse", deleteResponse as unknown as ActionConfig],
];

describe("Community actions: auth guard", () => {
	beforeEach(() => vi.clearAllMocks());

	it("all community actions return { success: false, error: 'Não autenticado.' } when unauthenticated", async () => {
		await fc.assert(
			fc.asyncProperty(fc.integer({ min: 0, max: allActions.length - 1 }), async (idx) => {
				vi.clearAllMocks();
				const [label, action] = allActions[idx];
				const result = await action.handler(new FormData(), makeUnauthContext());
				expect(result.success, `${label}: expected success === false`).toBe(false);
				expect(result.error, `${label}: expected 'Não autenticado.'`).toBe("Não autenticado.");
			}),
			{ numRuns: 100 },
		);
	});
});
