import { describe, it, expect, vi, beforeEach } from "vitest";
import * as fc from "fast-check";

vi.mock("../../lib/uploadthing", () => ({
	utapi: {
		uploadFiles: vi.fn(),
		deleteFiles: vi.fn().mockResolvedValue(undefined),
	},
}));

vi.mock("../../repositories/imagePost", () => ({
	imagePostRepository: {
		getLatestPostByAuthor: vi.fn(),
		getLatestCommentByAuthor: vi.fn(),
		getPostById: vi.fn(),
		getCommentWithPostAuthor: vi.fn(),
		insertPost: vi.fn(),
		insertComment: vi.fn(),
		deletePost: vi.fn(),
		deleteComment: vi.fn(),
	},
}));

vi.mock("../../repositories/userProfile", () => ({
	userProfileRepository: {
		getUserById: vi.fn(),
		updateUser: vi.fn(),
	},
}));

vi.mock("image-size", () => ({
	imageSize: vi.fn(),
}));

import { imagePostRepository } from "../../repositories/imagePost";
import { userProfileRepository } from "../../repositories/userProfile";
import { utapi } from "../../lib/uploadthing";
import { imageSize } from "image-size";

import {
	processAndUploadImagePost,
	removeImagePost,
	addImageComment,
	removeImageComment,
} from "../../services/imagePost";
import { updateProfileData, removeProfileImageFromUser } from "../../services/user/profile";

const SCREAMING_SNAKE_CASE = /^[A-Z][A-Z0-9_]+$/;

async function assertThrowsErrorCode(fn: () => Promise<unknown>) {
	await expect(fn()).rejects.toSatisfy(
		(e) => e instanceof Error && SCREAMING_SNAKE_CASE.test((e as Error).message),
	);
}

const smallFile = () => new File([new Uint8Array(10)], "img.png", { type: "image/png" });

describe("imagePost service: known failures throw SCREAMING_SNAKE_CASE error codes", () => {
	beforeEach(() => vi.clearAllMocks());

	it("FILE_TOO_LARGE when file.size > 60000", async () => {
		await fc.assert(
			fc.asyncProperty(
				fc.integer({ min: 60001, max: 200000 }),
				fc.string({ minLength: 1 }),
				async (size, userId) => {
					const bigFile = new File([new Uint8Array(size)], "big.png", { type: "image/png" });
					await assertThrowsErrorCode(() => processAndUploadImagePost(userId, bigFile));
				},
			),
			{ numRuns: 50 },
		);
	});

	it("INVALID_IMAGE_FILE when imageSize returns no dimensions", async () => {
		(imagePostRepository.getLatestPostByAuthor as ReturnType<typeof vi.fn>).mockResolvedValue(null);
		(imageSize as ReturnType<typeof vi.fn>).mockReturnValue({});
		await fc.assert(
			fc.asyncProperty(fc.string({ minLength: 1 }), async (userId) => {
				await assertThrowsErrorCode(() => processAndUploadImagePost(userId, smallFile()));
			}),
			{ numRuns: 50 },
		);
	});

	it("INVALID_IMAGE_DIMENSIONS when dimensions are not in the allowed set", async () => {
		(imagePostRepository.getLatestPostByAuthor as ReturnType<typeof vi.fn>).mockResolvedValue(null);
		(imageSize as ReturnType<typeof vi.fn>).mockReturnValue({ width: 7, height: 7 });
		await fc.assert(
			fc.asyncProperty(fc.string({ minLength: 1 }), async (userId) => {
				await assertThrowsErrorCode(() => processAndUploadImagePost(userId, smallFile()));
			}),
			{ numRuns: 50 },
		);
	});

	it("UPLOAD_FAILED when storage returns no url", async () => {
		(imagePostRepository.getLatestPostByAuthor as ReturnType<typeof vi.fn>).mockResolvedValue(null);
		(imageSize as ReturnType<typeof vi.fn>).mockReturnValue({ width: 10, height: 10 });
		(utapi.uploadFiles as ReturnType<typeof vi.fn>).mockResolvedValue({ data: null });
		await fc.assert(
			fc.asyncProperty(fc.string({ minLength: 1 }), async (userId) => {
				await assertThrowsErrorCode(() => processAndUploadImagePost(userId, smallFile()));
			}),
			{ numRuns: 50 },
		);
	});

	it("DB_INSERT_FAILED when insertPost throws", async () => {
		(imagePostRepository.getLatestPostByAuthor as ReturnType<typeof vi.fn>).mockResolvedValue(null);
		(imageSize as ReturnType<typeof vi.fn>).mockReturnValue({ width: 10, height: 10 });
		(utapi.uploadFiles as ReturnType<typeof vi.fn>).mockResolvedValue({
			data: { ufsUrl: "https://example.com/img.png" },
		});
		(imagePostRepository.insertPost as ReturnType<typeof vi.fn>).mockRejectedValue(
			new Error("db error"),
		);
		await fc.assert(
			fc.asyncProperty(fc.string({ minLength: 1 }), async (userId) => {
				await assertThrowsErrorCode(() => processAndUploadImagePost(userId, smallFile()));
			}),
			{ numRuns: 50 },
		);
	});

	it("INVALID_IMAGE_URL when imageUrl has no extractable key", async () => {
		await fc.assert(
			fc.asyncProperty(fc.constantFrom("https://example.com/"), async (imageUrl) => {
				await assertThrowsErrorCode(() => removeImagePost("user-1", "post-1", imageUrl));
			}),
			{ numRuns: 50 },
		);
	});

	it("POST_NOT_FOUND_OR_FORBIDDEN when deletePost returns []", async () => {
		(imagePostRepository.deletePost as ReturnType<typeof vi.fn>).mockResolvedValue([]);
		await fc.assert(
			fc.asyncProperty(
				fc.string({ minLength: 1 }),
				fc.string({ minLength: 1 }),
				async (userId, postId) => {
					await assertThrowsErrorCode(() =>
						removeImagePost(userId, postId, "https://example.com/img.png"),
					);
				},
			),
			{ numRuns: 50 },
		);
	});

	it("COMMENT_INVALID when sanitized body is empty", async () => {
		(imagePostRepository.getLatestCommentByAuthor as ReturnType<typeof vi.fn>).mockResolvedValue(
			null,
		);
		await fc.assert(
			fc.asyncProperty(fc.string({ minLength: 1 }), async (userId) => {
				await assertThrowsErrorCode(() =>
					addImageComment(userId, "post-1", "<script>alert(1)</script>"),
				);
			}),
			{ numRuns: 50 },
		);
	});

	it("POST_NOT_FOUND when post does not exist", async () => {
		(imagePostRepository.getLatestCommentByAuthor as ReturnType<typeof vi.fn>).mockResolvedValue(
			null,
		);
		(imagePostRepository.getPostById as ReturnType<typeof vi.fn>).mockResolvedValue(null);
		await fc.assert(
			fc.asyncProperty(
				fc.string({ minLength: 1 }),
				fc.string({ minLength: 1 }),
				async (userId, postId) => {
					await assertThrowsErrorCode(() => addImageComment(userId, postId, "hello"));
				},
			),
			{ numRuns: 50 },
		);
	});

	it("COMMENT_NOT_FOUND when comment does not exist", async () => {
		(imagePostRepository.getCommentWithPostAuthor as ReturnType<typeof vi.fn>).mockResolvedValue(
			null,
		);
		await fc.assert(
			fc.asyncProperty(
				fc.string({ minLength: 1 }),
				fc.string({ minLength: 1 }),
				async (userId, commentId) => {
					await assertThrowsErrorCode(() => removeImageComment(userId, commentId));
				},
			),
			{ numRuns: 50 },
		);
	});

	it("COMMENT_NOT_AUTHORIZED when caller is neither comment author nor post owner", async () => {
		(imagePostRepository.getCommentWithPostAuthor as ReturnType<typeof vi.fn>).mockResolvedValue({
			authorId: "other-user",
			post: { authorId: "another-user" },
		});
		await fc.assert(
			fc.asyncProperty(fc.string({ minLength: 1 }), async (callerId) => {
				await assertThrowsErrorCode(() => removeImageComment(callerId, "comment-1"));
			}),
			{ numRuns: 50 },
		);
	});
});

describe("user/profile service: known failures throw SCREAMING_SNAKE_CASE error codes", () => {
	beforeEach(() => vi.clearAllMocks());

	it("USER_NOT_FOUND when user does not exist", async () => {
		(userProfileRepository.getUserById as ReturnType<typeof vi.fn>).mockResolvedValue(null);
		await fc.assert(
			fc.asyncProperty(fc.string({ minLength: 1 }), async (userId) => {
				await assertThrowsErrorCode(() =>
					updateProfileData(userId, { username: "user", email: "user@example.com" }),
				);
			}),
			{ numRuns: 50 },
		);
	});

	it("UNIQUE_CONSTRAINT_VIOLATION when DB throws code 23505", async () => {
		const dbError = Object.assign(new Error("unique violation"), { code: "23505" });
		(userProfileRepository.updateUser as ReturnType<typeof vi.fn>).mockRejectedValue(dbError);
		await fc.assert(
			fc.asyncProperty(fc.string({ minLength: 1 }), async (userId) => {
				(userProfileRepository.getUserById as ReturnType<typeof vi.fn>).mockResolvedValue({
					id: userId,
					image: null,
				});
				await assertThrowsErrorCode(() =>
					updateProfileData(userId, { username: "user", email: "user@example.com" }),
				);
			}),
			{ numRuns: 50 },
		);
	});

	it("DB_UPDATE_FAILED on generic DB error", async () => {
		(userProfileRepository.updateUser as ReturnType<typeof vi.fn>).mockRejectedValue(
			new Error("connection reset"),
		);
		await fc.assert(
			fc.asyncProperty(fc.string({ minLength: 1 }), async (userId) => {
				(userProfileRepository.getUserById as ReturnType<typeof vi.fn>).mockResolvedValue({
					id: userId,
					image: null,
				});
				await assertThrowsErrorCode(() =>
					updateProfileData(userId, { username: "user", email: "user@example.com" }),
				);
			}),
			{ numRuns: 50 },
		);
	});

	it("NO_IMAGE_TO_REMOVE when user has no image", async () => {
		await fc.assert(
			fc.asyncProperty(fc.string({ minLength: 1 }), async (userId) => {
				(userProfileRepository.getUserById as ReturnType<typeof vi.fn>).mockResolvedValue({
					id: userId,
					image: null,
				});
				await assertThrowsErrorCode(() => removeProfileImageFromUser(userId));
			}),
			{ numRuns: 50 },
		);
	});
});
