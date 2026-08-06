import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * `drizzle/0007_fk_indexes.sql` creates every ordering index `DESC NULLS LAST`.
 * Drizzle's `desc()` emits a bare `DESC`, which Postgres reads as NULLS FIRST,
 * so a query written with `desc()` cannot use any of them — the planner scans
 * and sorts the whole table instead, and the LIMIT only trims the result after
 * the work is already done.
 *
 * These assertions pin the queries where that difference is measurable, so the
 * next edit cannot quietly put `desc()` back.
 */
const read = (relativePath: string) =>
	readFileSync(join(process.cwd(), relativePath), "utf-8");

describe("hot list queries order in a way the indexes can serve", () => {
	it("the homepage feed and the profile grid use descNullsLast", () => {
		const source = read("src/repositories/imagePost.ts");

		expect(source).toContain("descNullsLast(imagePosts.createdAt)");
		expect(source).not.toMatch(/orderBy:\s*desc\(imagePosts\.createdAt\)/);
	});

	it("both comment reads use descNullsLast", () => {
		const source = read("src/repositories/imagePost.ts");
		const ordered = source.match(/descNullsLast\(imagePostComments\.createdAt\)/g) ?? [];

		expect(ordered.length).toBeGreaterThanOrEqual(2);
	});

	it("the recados page filters on receiverId, which is what the index is keyed on", () => {
		const source = read("src/repositories/message.ts");

		expect(source).toContain("eq(messages.receiverId, receiverId)");
		expect(source).toContain("descNullsLast(messages.createdAt)");
		// Joining out to `users.username` leaves the planner without a constant
		// to probe `messages_receiver_created_idx` with.
		expect(source).not.toContain('alias(users, "receiver")');
	});

	it("a composite index exists for one page of a post's comments", () => {
		const schema = read("src/schemas/database.ts");

		expect(schema).toContain(
			'index("image_post_comments_image_created_idx").on(table.imageId, table.createdAt.desc())',
		);
	});
});
