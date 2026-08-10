import { describe, it, expect } from "vitest";
import crypto from "node:crypto";
import { hashPassword, validatePassword } from "../../utils/password";

describe("password hashing", () => {
	it("hashes with the versioned pbkdf2 format and validates a correct password", () => {
		const hash = hashPassword("correct horse battery staple");

		expect(hash).toMatch(/^pbkdf2\$210000\$/);

		expect(validatePassword(hash, "correct horse battery staple")).toBe(true);
		expect(validatePassword(hash, "wrong password")).toBe(false);
	});

	it("accepts legacy <hashHex>.<salt> hashes (10k iterations)", () => {
		// Reproduce the pre-versioning format exactly as the old code stored it.
		const salt = crypto.randomBytes(128).toString("base64");
		const legacyHash = crypto.pbkdf2Sync("legacy-pass", salt, 10_000, 512, "sha512");
		const stored = `${legacyHash.toString("hex")}.${salt}`;

		expect(validatePassword(stored, "legacy-pass")).toBe(true);
		expect(validatePassword(stored, "not-the-password")).toBe(false);
	});

	it("returns false for malformed stored hashes instead of throwing", () => {
		expect(validatePassword("not-a-valid-hash", "whatever")).toBe(false);
		expect(validatePassword("pbkdf2$notANumber$salt$hash", "whatever")).toBe(false);
		expect(validatePassword("", "whatever")).toBe(false);
	});
});
