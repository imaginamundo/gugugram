import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockGetMessagesByReceiverId } = vi.hoisted(() => ({
	mockGetMessagesByReceiverId: vi.fn(),
}));

vi.mock("../../repositories/message", () => ({
	messageRepository: {
		getMessagesByReceiverId: mockGetMessagesByReceiverId,
		getMessageById: vi.fn(),
		deleteMessageById: vi.fn(),
		getLatestMessageByAuthor: vi.fn(),
		insertMessage: vi.fn(),
		updateLastCheckedAt: vi.fn(),
	},
}));

import { getMessages, MESSAGES_PAGE_SIZE } from "../../services/message";

describe("getMessages: pagination bounds", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockGetMessagesByReceiverId.mockResolvedValue([]);
	});

	it("always requests a bounded window", async () => {
		await getMessages("user-1");
		expect(mockGetMessagesByReceiverId).toHaveBeenCalledWith("user-1", MESSAGES_PAGE_SIZE, 0);
	});

	it("offsets by whole pages", async () => {
		await getMessages("user-1", 3);
		expect(mockGetMessagesByReceiverId).toHaveBeenCalledWith(
			"user-1",
			MESSAGES_PAGE_SIZE,
			MESSAGES_PAGE_SIZE * 2,
		);
	});

	it("clamps non-positive pages to the first page instead of a negative offset", async () => {
		for (const page of [0, -1, -100]) {
			vi.clearAllMocks();
			await getMessages("user-1", page);
			expect(mockGetMessagesByReceiverId).toHaveBeenCalledWith("user-1", MESSAGES_PAGE_SIZE, 0);
		}
	});

	it("returns the rows under messagesReceived", async () => {
		mockGetMessagesByReceiverId.mockResolvedValue([{ id: "m1" }]);
		await expect(getMessages("user-1")).resolves.toEqual({ messagesReceived: [{ id: "m1" }] });
	});
});
