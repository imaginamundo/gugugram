import { describe, it, expect, vi, beforeEach } from "vitest";
import * as fc from "fast-check";

const { mockGetMessageById, mockDeleteMessageById } = vi.hoisted(() => ({
	mockGetMessageById: vi.fn(),
	mockDeleteMessageById: vi.fn(),
}));

vi.mock("../../repositories/message", () => ({
	messageRepository: {
		getMessageById: mockGetMessageById,
		deleteMessageById: mockDeleteMessageById,
		getLatestMessageByAuthor: vi.fn(),
		insertMessage: vi.fn(),
		getMessagesByUsername: vi.fn(),
		updateLastCheckedAt: vi.fn(),
	},
}));

import { deleteMessage } from "../../services/message";

describe("deleteMessage: ownership enforcement", () => {
	beforeEach(() => vi.clearAllMocks());

	it("throws FORBIDDEN when userId is neither authorId nor receiverId", async () => {
		await fc.assert(
			fc.asyncProperty(
				fc
					.tuple(
						fc.string({ minLength: 1 }),
						fc.string({ minLength: 1 }),
						fc.string({ minLength: 1 }),
					)
					.filter(([userId, authorId, receiverId]) => userId !== authorId && userId !== receiverId),
				async ([userId, authorId, receiverId]) => {
					vi.clearAllMocks();
					mockGetMessageById.mockResolvedValue({ id: "msg-1", authorId, receiverId });
					await expect(deleteMessage(userId, "msg-1")).rejects.toThrow("FORBIDDEN");
					expect(mockDeleteMessageById).not.toHaveBeenCalled();
				},
			),
			{ numRuns: 100 },
		);
	});

	it("succeeds when userId is the authorId", async () => {
		await fc.assert(
			fc.asyncProperty(
				fc.string({ minLength: 1 }),
				fc.string({ minLength: 1 }),
				async (authorId, receiverId) => {
					vi.clearAllMocks();
					mockGetMessageById.mockResolvedValue({ id: "msg-1", authorId, receiverId });
					mockDeleteMessageById.mockResolvedValue(undefined);
					await expect(deleteMessage(authorId, "msg-1")).resolves.not.toThrow();
					expect(mockDeleteMessageById).toHaveBeenCalledWith("msg-1");
				},
			),
			{ numRuns: 100 },
		);
	});

	it("succeeds when userId is the receiverId", async () => {
		await fc.assert(
			fc.asyncProperty(
				fc.string({ minLength: 1 }),
				fc.string({ minLength: 1 }),
				async (authorId, receiverId) => {
					vi.clearAllMocks();
					mockGetMessageById.mockResolvedValue({ id: "msg-1", authorId, receiverId });
					mockDeleteMessageById.mockResolvedValue(undefined);
					await expect(deleteMessage(receiverId, "msg-1")).resolves.not.toThrow();
					expect(mockDeleteMessageById).toHaveBeenCalledWith("msg-1");
				},
			),
			{ numRuns: 100 },
		);
	});

	it("throws MESSAGE_NOT_FOUND when message does not exist", async () => {
		await fc.assert(
			fc.asyncProperty(
				fc.string({ minLength: 1 }),
				fc.string({ minLength: 1 }),
				async (userId, messageId) => {
					vi.clearAllMocks();
					mockGetMessageById.mockResolvedValue(undefined);
					await expect(deleteMessage(userId, messageId)).rejects.toThrow("MESSAGE_NOT_FOUND");
					expect(mockDeleteMessageById).not.toHaveBeenCalled();
				},
			),
			{ numRuns: 100 },
		);
	});
});
