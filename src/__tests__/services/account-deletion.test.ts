import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockAccountsFindFirst, mockDeleteWhere, mockDelete } = vi.hoisted(() => {
	const mockAccountsFindFirst = vi.fn();
	const mockDeleteWhere = vi.fn();
	const mockDelete = vi.fn(() => ({ where: mockDeleteWhere }));
	return { mockAccountsFindFirst, mockDeleteWhere, mockDelete };
});

vi.mock("@infra/database", () => ({
	db: {
		query: { accounts: { findFirst: mockAccountsFindFirst } },
		delete: mockDelete,
	},
}));

vi.mock("@infra/storage", () => ({ storage: { delete: vi.fn().mockResolvedValue(undefined) } }));

vi.mock("@schemas/database", () => ({ accounts: {}, users: {} }));

vi.mock("@utils/password.ts", () => ({ validatePassword: vi.fn() }));

vi.mock("@repositories/imagePost", () => ({
	imagePostRepository: {
		getPostsByAuthor: vi.fn(),
		getCommentIdsByAuthor: vi.fn(),
	},
}));
vi.mock("@repositories/message", () => ({
	messageRepository: { getMessageIdsByAuthor: vi.fn() },
}));
vi.mock("@repositories/moderation", () => ({
	moderationRepository: { deleteReportsTargetingUser: vi.fn() },
}));
vi.mock("@repositories/userProfile", () => ({
	userProfileRepository: { getUserById: vi.fn() },
}));

vi.mock("drizzle-orm", async (importOriginal) => {
	const actual = await importOriginal<typeof import("drizzle-orm")>();
	return {
		...actual,
		and: vi.fn((...args) => ({ type: "and", args })),
		eq: vi.fn((col, val) => ({ type: "eq", col, val })),
	};
});

import { deleteOwnAccount } from "@services/auth/deletion";
import { storage } from "@infra/storage";
import { validatePassword } from "@utils/password.ts";
import { imagePostRepository } from "@repositories/imagePost";
import { messageRepository } from "@repositories/message";
import { moderationRepository } from "@repositories/moderation";
import { userProfileRepository } from "@repositories/userProfile";
import { AccountDeletionErrors } from "@customTypes/errors";

const USER_ID = "user-1";

function primeHappyPath() {
	mockAccountsFindFirst.mockResolvedValue({ password: "stored-hash" });
	vi.mocked(validatePassword).mockReturnValue(true);
	mockDeleteWhere.mockResolvedValue({ rowCount: 1 });
	vi.mocked(userProfileRepository.getUserById).mockResolvedValue({
		image: "https://cdn.example/avatar-key",
	} as never);
	vi.mocked(imagePostRepository.getPostsByAuthor).mockResolvedValue([
		{ id: "post-1", image: "https://cdn.example/img-1" },
		{ id: "post-2", image: "https://cdn.example/img-2" },
	] as never);
	vi.mocked(imagePostRepository.getCommentIdsByAuthor).mockResolvedValue(["c-1", "c-2"]);
	vi.mocked(messageRepository.getMessageIdsByAuthor).mockResolvedValue(["m-1"]);
	vi.mocked(moderationRepository.deleteReportsTargetingUser).mockResolvedValue(undefined as never);
}

describe("deleteOwnAccount", () => {
	beforeEach(() => vi.clearAllMocks());

	it("rejects a wrong password and deletes nothing", async () => {
		mockAccountsFindFirst.mockResolvedValue({ password: "stored-hash" });
		vi.mocked(validatePassword).mockReturnValue(false);

		await expect(deleteOwnAccount(USER_ID, "nope")).rejects.toThrow(
			AccountDeletionErrors.WRONG_PASSWORD,
		);
		expect(mockDelete).not.toHaveBeenCalled();
		expect(moderationRepository.deleteReportsTargetingUser).not.toHaveBeenCalled();
		expect(storage.delete).not.toHaveBeenCalled();
	});

	it("rejects when no credential row exists", async () => {
		mockAccountsFindFirst.mockResolvedValue(undefined);

		await expect(deleteOwnAccount(USER_ID, "pw")).rejects.toThrow(
			AccountDeletionErrors.WRONG_PASSWORD,
		);
		expect(mockDelete).not.toHaveBeenCalled();
	});

	it("deletes the user row after the password checks out", async () => {
		primeHappyPath();
		await deleteOwnAccount(USER_ID, "correct");
		expect(mockDelete).toHaveBeenCalledTimes(1);
	});

	it("purges moderation reports targeting the user and all their content", async () => {
		primeHappyPath();
		await deleteOwnAccount(USER_ID, "correct");

		expect(moderationRepository.deleteReportsTargetingUser).toHaveBeenCalledWith({
			userId: USER_ID,
			postIds: ["post-1", "post-2"],
			commentIds: ["c-1", "c-2"],
			messageIds: ["m-1"],
		});
	});

	it("removes the avatar blob and every post image blob from storage", async () => {
		primeHappyPath();
		await deleteOwnAccount(USER_ID, "correct");

		const deletedKeys = vi.mocked(storage.delete).mock.calls.map(([key]) => key);
		expect(deletedKeys).toEqual(
			expect.arrayContaining(["avatar-key", "img-1", "img-2"]),
		);
		expect(deletedKeys).toHaveLength(3);
	});

	it("skips storage entirely when the user has no avatar and no posts", async () => {
		primeHappyPath();
		vi.mocked(userProfileRepository.getUserById).mockResolvedValue({ image: null } as never);
		vi.mocked(imagePostRepository.getPostsByAuthor).mockResolvedValue([] as never);

		await deleteOwnAccount(USER_ID, "correct");
		expect(storage.delete).not.toHaveBeenCalled();
	});

	it("does not let a storage failure fail the deletion", async () => {
		primeHappyPath();
		vi.mocked(storage.delete).mockRejectedValueOnce(new Error("UT down"));

		await expect(deleteOwnAccount(USER_ID, "correct")).resolves.toBeUndefined();
		expect(moderationRepository.deleteReportsTargetingUser).toHaveBeenCalled();
	});
});
