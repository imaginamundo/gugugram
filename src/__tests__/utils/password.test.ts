import crypto from "node:crypto";
import { readFileSync } from "fs";
import { join } from "path";
import { describe, it, expect } from "vitest";

import { hashPassword, needsRehash, validatePassword } from "../../utils/password";

/** Reproduces the pre-change format: `<hash>.<salt>`, 10,000 iterations, 512-byte key. */
const legacyHash = (password: string) => {
	const salt = crypto.randomBytes(128).toString("base64");
	const hash = crypto.pbkdf2Sync(password, salt, 10000, 512, "sha512");
	return `${hash.toString("hex")}.${salt}`;
};

describe("hashPassword", () => {
	it("emits a self-describing hash at the current work factor", () => {
		const [scheme, iterations, salt, hash] = hashPassword("correct horse").split("$");

		expect(scheme).toBe("pbkdf2-sha512");
		expect(Number(iterations)).toBeGreaterThanOrEqual(210_000);
		expect(salt.length).toBeGreaterThan(0);
		// 64 bytes — the native SHA-512 output size — as hex.
		expect(hash).toHaveLength(128);
	});

	it("salts every hash separately", () => {
		expect(hashPassword("same password")).not.toBe(hashPassword("same password"));
	});
});

describe("validatePassword", () => {
	it("accepts the password it was derived from", () => {
		expect(validatePassword(hashPassword("correct horse"), "correct horse")).toBe(true);
	});

	it("rejects a wrong password", () => {
		expect(validatePassword(hashPassword("correct horse"), "correct horse ")).toBe(false);
	});

	it("still accepts passwords stored in the legacy format", () => {
		expect(validatePassword(legacyHash("correct horse"), "correct horse")).toBe(true);
		expect(validatePassword(legacyHash("correct horse"), "wrong")).toBe(false);
	});

	// `crypto.timingSafeEqual` throws ERR_CRYPTO_TIMING_SAFE_EQUAL_LENGTH when the
	// buffers differ in length, which turned a corrupt row into a 500 on login.
	it.each([
		["empty", ""],
		["no separator", "deadbeef"],
		["truncated legacy hash", "deadbeef.c2FsdA=="],
		["empty legacy salt", `${"ab".repeat(512)}.`],
		["non-hex body", `pbkdf2-sha512$210000$c2FsdA==$zzzz`],
		["odd-length hex", `pbkdf2-sha512$210000$c2FsdA==$abc`],
		["missing hash", "pbkdf2-sha512$210000$c2FsdA==$"],
		["zero iterations", `pbkdf2-sha512$0$c2FsdA==$${"ab".repeat(64)}`],
		["non-numeric iterations", `pbkdf2-sha512$many$c2FsdA==$${"ab".repeat(64)}`],
	])("returns false instead of throwing for a %s stored hash", (_label, stored) => {
		expect(() => validatePassword(stored, "correct horse")).not.toThrow();
		expect(validatePassword(stored, "correct horse")).toBe(false);
	});
});

describe("needsRehash", () => {
	it("flags legacy hashes", () => {
		expect(needsRehash(legacyHash("correct horse"))).toBe(true);
	});

	it("flags hashes below the current iteration count", () => {
		const weak = `pbkdf2-sha512$1000$c2FsdA==$${"ab".repeat(64)}`;
		expect(needsRehash(weak)).toBe(true);
	});

	it("leaves current hashes alone", () => {
		expect(needsRehash(hashPassword("correct horse"))).toBe(false);
	});

	it("does not flag unparseable hashes, which cannot be verified anyway", () => {
		expect(needsRehash("garbage")).toBe(false);
	});
});

describe("auth.ts password policy", () => {
	const authSource = readFileSync(join(process.cwd(), "src/auth.ts"), "utf-8");

	it("requires at least 8 characters when a password is set", () => {
		const match = authSource.match(/minPasswordLength:\s*(\d+)/);
		expect(Number(match?.[1])).toBeGreaterThanOrEqual(8);
	});

	it("upgrades a legacy hash on a successful sign-in", () => {
		expect(authSource).toContain("needsRehash(hash)");
	});
});
