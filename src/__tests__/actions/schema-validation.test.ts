import { describe, it, expect, vi, beforeEach } from "vitest";
import * as fc from "fast-check";

vi.mock("../../services/imagePost", () => ({
	processAndUploadImagePost: vi.fn(),
	removeImagePost: vi.fn(),
	addImageComment: vi.fn(),
	removeImageComment: vi.fn(),
}));
vi.mock("../../services/user/profile", () => ({
	updateProfileData: vi.fn(),
	removeProfileImageFromUser: vi.fn(),
}));
vi.mock("../../services/user/friends", () => ({
	processFriendRequest: vi.fn(),
	acceptPendingFriendRequest: vi.fn(),
	deleteFriendship: vi.fn(),
}));
vi.mock("../../services/message", () => ({
	processAndSendMessage: vi.fn(),
	deleteMessage: vi.fn(),
	updateLastCheckedMessages: vi.fn(),
}));
vi.mock("../../observability/tracking-server", () => ({
	trackServerEvent: vi.fn(),
	flushServerEvents: vi.fn().mockResolvedValue(undefined),
	identifyUserServer: vi.fn(),
}));

import {
	uploadImagePost,
	deleteImagePost,
	sendImagePostComment,
	deleteImagePostComment,
} from "../../actions/_imagePost";
import {
	sendFriendRequest,
	acceptFriendRequest,
	removeFriendship,
} from "../../actions/_friendshipRelation";
import { sendMessage, removeMessage } from "../../actions/_message";

type ActionConfig = { handler: (input: FormData, ctx: unknown) => Promise<unknown> };

const fakeSession = { id: "user-1", username: "testuser" };

function makeAuthContext() {
	return {
		locals: { user: fakeSession, session: fakeSession },
		cookies: { set: vi.fn(), get: vi.fn(), delete: vi.fn() },
		request: new Request("http://localhost/", { method: "POST" }),
	};
}

// updateProfile returns "Erro ao validar dados." on schema failure — excluded here
const schemaValidatedHandlers: Array<[string, ActionConfig]> = [
	["uploadImagePost", uploadImagePost as unknown as ActionConfig],
	["deleteImagePost", deleteImagePost as unknown as ActionConfig],
	["sendImagePostComment", sendImagePostComment as unknown as ActionConfig],
	["deleteImagePostComment", deleteImagePostComment as unknown as ActionConfig],
	["sendFriendRequest", sendFriendRequest as unknown as ActionConfig],
	["acceptFriendRequest", acceptFriendRequest as unknown as ActionConfig],
	["removeFriendship", removeFriendship as unknown as ActionConfig],
	["sendMessage", sendMessage as unknown as ActionConfig],
	["removeMessage", removeMessage as unknown as ActionConfig],
];

const invalidFormDataArb = fc.oneof(
	fc.constant(new FormData()),
	fc
		.array(fc.tuple(fc.string({ minLength: 1 }), fc.string()), { minLength: 1, maxLength: 5 })
		.map((pairs) => {
			const fd = new FormData();
			for (const [k, v] of pairs) fd.append(`__invalid_${k}`, v);
			return fd;
		}),
);

describe("invalid input returns validation error", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("every schema-validated action returns 'Dados inválidos.' when input fails validation", async () => {
		await fc.assert(
			fc.asyncProperty(
				fc.integer({ min: 0, max: schemaValidatedHandlers.length - 1 }),
				invalidFormDataArb,
				async (idx, invalidInput) => {
					vi.clearAllMocks();
					const [label, action] = schemaValidatedHandlers[idx];
					const ctx = makeAuthContext();

					const result = (await action.handler(invalidInput, ctx)) as {
						success: boolean;
						error?: string;
					};

					expect(result.success, `${label}: expected success === false`).toBe(false);
					expect(result.error, `${label}: expected error === "Dados inválidos."`).toBe(
						"Dados inválidos.",
					);
				},
			),
			{ numRuns: 100 },
		);
	});
});
