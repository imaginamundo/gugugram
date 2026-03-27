import { describe, it, expect, vi, beforeEach } from "vitest";
import * as fc from "fast-check";

vi.mock("../../lib/uploadthing", () => ({
	utapi: {
		uploadFiles: vi.fn().mockResolvedValue({ data: { ufsUrl: "https://example.com/img.png" } }),
		deleteFiles: vi.fn().mockResolvedValue(undefined),
	},
}));

vi.mock("../../repositories/imagePost", () => ({
	imagePostRepository: {
		getLatestPostByAuthor: vi.fn().mockResolvedValue(null),
		getLatestCommentByAuthor: vi.fn().mockResolvedValue(null),
		getPostById: vi.fn(),
		insertPost: vi.fn().mockResolvedValue(undefined),
		insertComment: vi.fn().mockResolvedValue(undefined),
	},
}));

vi.mock("image-size", () => ({
	imageSize: vi.fn().mockReturnValue({ width: 10, height: 10 }),
}));

import { imagePostRepository } from "../../repositories/imagePost";
import { processAndUploadImagePost, addImageComment } from "../../services/imagePost";

/** Generates a string that contains at least one HTML tag */
const htmlSnippetArb = fc.oneof(
	fc.constant("<script>alert(1)</script>"),
	fc.constant("<b>bold</b>"),
	fc.constant("<img src=x onerror=alert(1)>"),
	fc.constant("<a href='javascript:void(0)'>click</a>"),
	fc.constant("<h1>title</h1>"),
);

/** Combines arbitrary plain text with an HTML snippet */
const textWithHtmlArb = fc
	.tuple(fc.string(), htmlSnippetArb, fc.string())
	.map(([prefix, html, suffix]) => prefix + html + suffix);

describe("service sanitizes HTML before persisting", () => {
	beforeEach(() => vi.clearAllMocks());

	it("processAndUploadImagePost: description passed to insertPost contains no HTML tags", async () => {
		await fc.assert(
			fc.asyncProperty(textWithHtmlArb, async (description) => {
				vi.clearAllMocks();
				(imagePostRepository.getLatestPostByAuthor as ReturnType<typeof vi.fn>).mockResolvedValue(
					null,
				);
				(imagePostRepository.insertPost as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

				const file = new File([new Uint8Array(10)], "img.png", { type: "image/png" });
				await processAndUploadImagePost("user-1", file, description);

				const calls = (imagePostRepository.insertPost as ReturnType<typeof vi.fn>).mock.calls;
				expect(calls.length, "insertPost must have been called once").toBe(1);

				const persistedDescription: string | null = calls[0][2];
				if (persistedDescription !== null) {
					expect(persistedDescription, "persisted description must not contain '<'").not.toContain(
						"<",
					);
					expect(persistedDescription, "persisted description must not contain '>'").not.toContain(
						">",
					);
				}
			}),
			{ numRuns: 100 },
		);
	});

	it("addImageComment: body passed to insertComment contains no HTML tags", async () => {
		await fc.assert(
			fc.asyncProperty(textWithHtmlArb, async (body) => {
				vi.clearAllMocks();
				(
					imagePostRepository.getLatestCommentByAuthor as ReturnType<typeof vi.fn>
				).mockResolvedValue(null);
				(imagePostRepository.getPostById as ReturnType<typeof vi.fn>).mockResolvedValue({
					id: "post-1",
				});
				(imagePostRepository.insertComment as ReturnType<typeof vi.fn>).mockResolvedValue(
					undefined,
				);

				try {
					await addImageComment("user-1", "post-1", body);
				} catch {
					// COMMENT_INVALID: sanitized body was empty — insertComment must not have been called
					expect(
						imagePostRepository.insertComment,
						"insertComment must not be called on error path",
					).not.toHaveBeenCalled();
					return;
				}

				const calls = (imagePostRepository.insertComment as ReturnType<typeof vi.fn>).mock.calls;
				const persistedBody: string = calls[0][2];
				expect(persistedBody, "persisted body must not contain '<'").not.toContain("<");
				expect(persistedBody, "persisted body must not contain '>'").not.toContain(">");
			}),
			{ numRuns: 100 },
		);
	});
});
