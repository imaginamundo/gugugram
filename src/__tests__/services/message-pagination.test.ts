import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockGetMessagesByUsername } = vi.hoisted(() => ({
	mockGetMessagesByUsername: vi.fn(),
}));

vi.mock("../../repositories/message", () => ({
	messageRepository: {
		getMessagesByUsername: mockGetMessagesByUsername,
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
		mockGetMessagesByUsername.mockResolvedValue([]);
	});

	it("always requests a bounded window", async () => {
		await getMessages("someone");
		expect(mockGetMessagesByUsername).toHaveBeenCalledWith("someone", MESSAGES_PAGE_SIZE, 0);
	});

	it("offsets by whole pages", async () => {
		await getMessages("someone", 3);
		expect(mockGetMessagesByUsername).toHaveBeenCalledWith(
			"someone",
			MESSAGES_PAGE_SIZE,
			MESSAGES_PAGE_SIZE * 2,
		);
	});

	it("clamps non-positive pages to the first page instead of a negative offset", async () => {
		for (const page of [0, -1, -100]) {
			vi.clearAllMocks();
			await getMessages("someone", page);
			expect(mockGetMessagesByUsername).toHaveBeenCalledWith("someone", MESSAGES_PAGE_SIZE, 0);
		}
	});

	it("returns the rows under messagesReceived", async () => {
		mockGetMessagesByUsername.mockResolvedValue([{ id: "m1" }]);
		await expect(getMessages("someone")).resolves.toEqual({ messagesReceived: [{ id: "m1" }] });
	});
});
