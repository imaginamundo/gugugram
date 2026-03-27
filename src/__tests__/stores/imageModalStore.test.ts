import { describe, it, expect, vi, beforeEach } from "vitest";
import * as fc from "fast-check";
import type { PostType } from "../../services/imagePost";

vi.mock("../../services/imagePost", () => ({}));

import { imageModalStore } from "../../stores/imagePostModalStore.svelte";

const postArbitrary: fc.Arbitrary<PostType> = fc.record({
	id: fc.string({ minLength: 1 }),
	image: fc.string({ minLength: 1 }),
	description: fc.option(fc.string({ minLength: 1 }), { nil: null }),
	commentsCount: fc.integer({ min: 0 }),
	userId: fc.string({ minLength: 1 }),
	username: fc.string({ minLength: 1 }),
	createdAt: fc.date(),
});

beforeEach(() => {
	imageModalStore.clear();
});

describe("imageModalStore", () => {
	it("round-trip: reading post after setting it returns the same value", () => {
		fc.assert(
			fc.property(postArbitrary, (post) => {
				imageModalStore.clear();
				imageModalStore.post = post;
				expect(imageModalStore.post).toEqual(post);
			}),
			{ numRuns: 100 },
		);
	});

	it("clear: post is undefined after clear, and remains undefined after a second clear", () => {
		fc.assert(
			fc.property(postArbitrary, (post) => {
				imageModalStore.post = post;
				imageModalStore.clear();
				expect(imageModalStore.post).toBeUndefined();
				imageModalStore.clear();
				expect(imageModalStore.post).toBeUndefined();
			}),
			{ numRuns: 100 },
		);
	});
});
