import { describe, it, expect, vi, beforeEach } from "vitest";
import * as fc from "fast-check";

vi.mock("../../services/imagePost", () => ({
	processAndUploadImagePost: vi.fn(),
	removeImagePost: vi.fn(),
	addImageComment: vi.fn(),
	removeImageComment: vi.fn(),
}));

vi.mock("../../observability/tracking-server", () => ({
	trackServerEvent: vi.fn(),
	flushServerEvents: vi.fn().mockResolvedValue(undefined),
}));

import { withAuth } from "../../utils/action-guard";

function makeUnauthContext() {
	return {
		locals: { user: null, session: null },
		cookies: { set: vi.fn(), get: vi.fn(), delete: vi.fn() },
		request: new Request("http://localhost/", { method: "POST" }),
	};
}

function makeAuthContext(userId = "user-1", username = "testuser") {
	return {
		locals: {
			user: { id: userId, username, email: `${username}@example.com` },
			session: { id: "session-1" },
		},
		cookies: { set: vi.fn(), get: vi.fn(), delete: vi.fn() },
		request: new Request("http://localhost/", { method: "POST" }),
	};
}

describe("withAuth: unauthenticated context", () => {
	beforeEach(() => vi.clearAllMocks());

	it("returns { success: false, error: 'Não autenticado.' } and never calls the inner handler", async () => {
		await fc.assert(
			fc.asyncProperty(fc.constant(null), async () => {
				const inner = vi.fn().mockResolvedValue({ success: true });
				const result = await withAuth(inner)(new FormData(), makeUnauthContext() as never);
				expect(result).toEqual({ success: false, error: "Não autenticado." });
				expect(inner).not.toHaveBeenCalled();
			}),
			{ numRuns: 100 },
		);
	});
});

describe("withAuth: authenticated context", () => {
	beforeEach(() => vi.clearAllMocks());

	it("calls the inner handler and forwards its return value", async () => {
		await fc.assert(
			fc.asyncProperty(
				fc.string({ minLength: 1 }),
				fc.string({ minLength: 1 }),
				async (userId, username) => {
					const inner = vi.fn().mockResolvedValue({ success: true, data: userId });
					const result = await withAuth(inner)(
						new FormData(),
						makeAuthContext(userId, username) as never,
					);
					expect(result).toEqual({ success: true, data: userId });
					expect(inner).toHaveBeenCalledOnce();
				},
			),
			{ numRuns: 100 },
		);
	});
});
