// Feature: communities, Property 20: Slug gerado é idempotente e normalizado
// Feature: communities, Property 21: Slugs de títulos distintos após normalização são detectados como duplicatas
import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { slugify } from "../../utils/slugify";

describe("Property 20: Slug gerado é idempotente e normalizado", () => {
	it("slugify is idempotent: applying it twice yields the same result as once", () => {
		fc.assert(
			fc.property(fc.string({ minLength: 1 }), (title) => {
				const once = slugify(title);
				const twice = slugify(once);
				expect(twice).toBe(once);
			}),
			{ numRuns: 100 },
		);
	});

	it("slug contains only lowercase alphanumeric characters and hyphens", () => {
		fc.assert(
			fc.property(fc.string({ minLength: 1 }), (title) => {
				const slug = slugify(title);
				expect(slug).toMatch(/^[a-z0-9-]*$/);
			}),
			{ numRuns: 100 },
		);
	});

	it("slug does not contain consecutive hyphens", () => {
		fc.assert(
			fc.property(fc.string({ minLength: 1 }), (title) => {
				const slug = slugify(title);
				expect(slug).not.toMatch(/--/);
			}),
			{ numRuns: 100 },
		);
	});

	it("slug does not contain uppercase letters", () => {
		fc.assert(
			fc.property(fc.string({ minLength: 1 }), (title) => {
				const slug = slugify(title);
				expect(slug).toBe(slug.toLowerCase());
			}),
			{ numRuns: 100 },
		);
	});
});

describe("Property 21: Slugs de títulos distintos após normalização são detectados como duplicatas", () => {
	it("titles that differ only in case produce the same slug", () => {
		fc.assert(
			fc.property(
				fc.string({ minLength: 1, maxLength: 50 }).filter((s) => /[a-zA-Z]/.test(s)),
				(title) => {
					const lower = slugify(title.toLowerCase());
					const upper = slugify(title.toUpperCase());
					expect(lower).toBe(upper);
				},
			),
			{ numRuns: 100 },
		);
	});

	it("titles that differ only in accents produce the same slug", () => {
		const accentPairs: [string, string][] = [
			["Pixel Art", "Píxel Àrt"],
			["cafe", "café"],
			["resume", "résumé"],
			["Comunidade", "Cõmünïdàdé"],
		];

		for (const [plain, accented] of accentPairs) {
			expect(slugify(plain)).toBe(slugify(accented));
		}
	});

	it("titles that differ only in special characters produce the same slug", () => {
		fc.assert(
			fc.property(
				fc.string({ minLength: 3, maxLength: 50 }).filter((s) => /[a-zA-Z0-9]/.test(s)),
				(base) => {
					const withSpecial = `${base}!@#$%`;
					const withoutSpecial = base;
					// Both should produce slugs that are equal or the base slug is a prefix/equal
					const slugBase = slugify(withoutSpecial);
					const slugSpecial = slugify(withSpecial);
					// The special characters version slug should equal the base slug
					// (special chars are stripped, so they don't change the slug)
					expect(slugSpecial).toBe(slugBase);
				},
			),
			{ numRuns: 100 },
		);
	});

	it("two titles that normalize to the same slug are detected as duplicates via slug comparison", () => {
		fc.assert(
			fc.property(
				fc.string({ minLength: 3, maxLength: 50 }).filter((s) => /[a-z]/i.test(s)),
				(title) => {
					// Inserting extra spaces between words should not change the slug
					const withExtraSpaces = title.replace(/\s+/g, "   ");
					const slugOriginal = slugify(title);
					const slugVariant = slugify(withExtraSpaces);
					expect(slugOriginal).toBe(slugVariant);
				},
			),
			{ numRuns: 100 },
		);
	});
});
