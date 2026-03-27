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
vi.mock("../../lib/tracking-server", () => ({
	trackServerEvent: vi.fn(),
	flushServerEvents: vi.fn().mockResolvedValue(undefined),
	identifyUserServer: vi.fn(),
}));

import * as imagePostSvc from "../../services/imagePost";
import * as messageSvc from "../../services/message";
import * as friendSvc from "../../services/user/friends";

import { sendMessage } from "../../actions/_message";
import {
	deleteImagePost,
	sendImagePostComment,
	deleteImagePostComment,
} from "../../actions/_imagePost";
import { sendFriendRequest } from "../../actions/_friendshipRelation";

type ActionConfig = {
	handler: (input: FormData, ctx: unknown) => Promise<{ success: boolean; error?: string }>;
};

const fakeSession = { id: "user-1", username: "testuser" };

function makeAuthContext() {
	return {
		locals: { user: fakeSession, session: fakeSession },
		cookies: { set: vi.fn(), get: vi.fn(), delete: vi.fn() },
		request: new Request("http://localhost/", { method: "POST" }),
	};
}

function validSendMessageInput(): FormData {
	const fd = new FormData();
	fd.append("receiverId", "receiver-123");
	fd.append("body", "hello");
	return fd;
}

function validDeleteImagePostInput(): FormData {
	const fd = new FormData();
	fd.append("id", "post-123");
	fd.append("imageUrl", "https://example.com/img.png");
	return fd;
}

function validSendCommentInput(): FormData {
	const fd = new FormData();
	fd.append("imageId", "post-123");
	fd.append("body", "nice pic");
	return fd;
}

function validDeleteCommentInput(): FormData {
	const fd = new FormData();
	fd.append("commentId", "comment-123");
	return fd;
}

function validFriendRequestInput(): FormData {
	const fd = new FormData();
	fd.append("targetUserId", "user-456");
	return fd;
}

// Error codes handled by switch statements in actions — excluded from passthrough test
const SWITCH_CODES = [
	"FILE_TOO_LARGE",
	"INVALID_IMAGE_FILE",
	"INVALID_IMAGE_DIMENSIONS",
	"UPLOAD_FAILED",
	"DB_INSERT_FAILED",
	"INVALID_IMAGE_URL",
	"POST_NOT_FOUND_OR_FORBIDDEN",
	"COMMENT_INVALID",
	"POST_NOT_FOUND",
	"COMMENT_NOT_FOUND",
	"COMMENT_NOT_AUTHORIZED",
	"INVALID_ACTION",
];

const SQL_FRAGMENTS = [
	"SELECT",
	"INSERT",
	"UPDATE",
	"DELETE",
	"pg error",
	"at Object",
	"at async",
	"stack trace",
];

describe("service error propagation", () => {
	beforeEach(() => vi.clearAllMocks());

	it("action returns { success: false, error: error.message } when service throws Error", async () => {
		await fc.assert(
			fc.asyncProperty(
				fc.string({ minLength: 1 }).filter((s) => !SWITCH_CODES.includes(s)),
				async (errorMessage) => {
					(messageSvc.processAndSendMessage as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
						new Error(errorMessage),
					);

					const result = await (sendMessage as unknown as ActionConfig).handler(
						validSendMessageInput(),
						makeAuthContext(),
					);

					expect(result.success, "expected success === false").toBe(false);
					expect(result.error, "expected error === errorMessage").toBe(errorMessage);
				},
			),
			{ numRuns: 100 },
		);
	});
});

type ErrorCodeCase = {
	code: string;
	action: ActionConfig;
	input: () => FormData;
	mockKey: string;
	svcNs: Record<string, ReturnType<typeof vi.fn>>;
};

const knownErrorCodes: ErrorCodeCase[] = [
	{
		code: "INVALID_IMAGE_URL",
		action: deleteImagePost as unknown as ActionConfig,
		input: validDeleteImagePostInput,
		mockKey: "removeImagePost",
		svcNs: imagePostSvc as unknown as Record<string, ReturnType<typeof vi.fn>>,
	},
	{
		code: "POST_NOT_FOUND_OR_FORBIDDEN",
		action: deleteImagePost as unknown as ActionConfig,
		input: validDeleteImagePostInput,
		mockKey: "removeImagePost",
		svcNs: imagePostSvc as unknown as Record<string, ReturnType<typeof vi.fn>>,
	},
	{
		code: "COMMENT_INVALID",
		action: sendImagePostComment as unknown as ActionConfig,
		input: validSendCommentInput,
		mockKey: "addImageComment",
		svcNs: imagePostSvc as unknown as Record<string, ReturnType<typeof vi.fn>>,
	},
	{
		code: "POST_NOT_FOUND",
		action: sendImagePostComment as unknown as ActionConfig,
		input: validSendCommentInput,
		mockKey: "addImageComment",
		svcNs: imagePostSvc as unknown as Record<string, ReturnType<typeof vi.fn>>,
	},
	{
		code: "COMMENT_NOT_FOUND",
		action: deleteImagePostComment as unknown as ActionConfig,
		input: validDeleteCommentInput,
		mockKey: "removeImageComment",
		svcNs: imagePostSvc as unknown as Record<string, ReturnType<typeof vi.fn>>,
	},
	{
		code: "COMMENT_NOT_AUTHORIZED",
		action: deleteImagePostComment as unknown as ActionConfig,
		input: validDeleteCommentInput,
		mockKey: "removeImageComment",
		svcNs: imagePostSvc as unknown as Record<string, ReturnType<typeof vi.fn>>,
	},
	{
		code: "INVALID_ACTION",
		action: sendFriendRequest as unknown as ActionConfig,
		input: validFriendRequestInput,
		mockKey: "processFriendRequest",
		svcNs: friendSvc as unknown as Record<string, ReturnType<typeof vi.fn>>,
	},
];

describe("known error codes translate to pt-BR messages", () => {
	beforeEach(() => vi.clearAllMocks());

	it("known Error_Code is translated to a non-empty pt-BR string, not returned raw", async () => {
		await fc.assert(
			fc.asyncProperty(
				fc.constantFrom(...knownErrorCodes),
				async ({ code, action, input, mockKey, svcNs }) => {
					svcNs[mockKey].mockRejectedValueOnce(new Error(code));

					const result = await action.handler(input(), makeAuthContext());

					expect(result.success, `${code}: expected success === false`).toBe(false);
					expect(result.error, `${code}: expected a non-empty error string`).toBeTruthy();
					expect(result.error, `${code}: error must not equal the raw Error_Code`).not.toBe(code);
					expect(result.error, `${code}: error must not be SCREAMING_SNAKE_CASE`).not.toMatch(
						/^[A-Z][A-Z0-9_]+$/,
					);
				},
			),
			{ numRuns: 100 },
		);
	});
});

describe("non-Error throws produce generic fallback", () => {
	beforeEach(() => vi.clearAllMocks());

	it("action returns a generic pt-BR fallback when service throws a non-Error value", async () => {
		const nonErrorArb = fc.oneof(
			fc.string(),
			fc.integer(),
			fc.boolean(),
			fc.record({ msg: fc.string() }),
			fc.constant(null),
			fc.constant(undefined),
		);

		await fc.assert(
			fc.asyncProperty(nonErrorArb, async (thrownValue) => {
				(messageSvc.processAndSendMessage as ReturnType<typeof vi.fn>).mockImplementationOnce(() =>
					Promise.reject(thrownValue),
				);

				const result = await (sendMessage as unknown as ActionConfig).handler(
					validSendMessageInput(),
					makeAuthContext(),
				);

				expect(result.success, "expected success === false").toBe(false);
				expect(result.error, "expected a non-empty fallback error string").toBeTruthy();
				if (typeof thrownValue === "string" && thrownValue.length > 0) {
					expect(result.error, "must not expose the thrown string value").not.toBe(thrownValue);
				}
			}),
			{ numRuns: 100 },
		);
	});
});

describe("action response never exposes DB error details", () => {
	beforeEach(() => vi.clearAllMocks());

	it("action error string contains no SQL fragments when service throws an Error_Code", async () => {
		const errorCodeArb = fc.constantFrom(
			"INVALID_IMAGE_URL",
			"POST_NOT_FOUND_OR_FORBIDDEN",
			"COMMENT_INVALID",
			"POST_NOT_FOUND",
			"COMMENT_NOT_FOUND",
			"COMMENT_NOT_AUTHORIZED",
		);

		await fc.assert(
			fc.asyncProperty(errorCodeArb, async (errorCode) => {
				(imagePostSvc.removeImagePost as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
					new Error(errorCode),
				);

				const result = await (deleteImagePost as unknown as ActionConfig).handler(
					validDeleteImagePostInput(),
					makeAuthContext(),
				);

				expect(result.success, "expected success === false").toBe(false);

				const errorStr = result.error ?? "";
				for (const fragment of SQL_FRAGMENTS) {
					expect(errorStr, `response must not contain "${fragment}"`).not.toContain(fragment);
				}
			}),
			{ numRuns: 100 },
		);
	});
});
