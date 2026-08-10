import crypto from "node:crypto";

const PBKDF2_ITERATIONS = 210_000;
// Iteration count used by the legacy `<hashHex>.<salt>` format.
const LEGACY_PBKDF2_ITERATIONS = 10_000;
const KEY_LENGTH = 512;
const DIGEST = "sha512";

export const hashPassword = (password: string) => {
	const salt = crypto.randomBytes(128).toString("base64");
	const hash = crypto.pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, KEY_LENGTH, DIGEST);
	return `pbkdf2$${PBKDF2_ITERATIONS}$${salt}$${hash.toString("hex")}`;
};

export const validatePassword = (hash: string, suppliedPassword: string) => {
	let iterations: number;
	let salt: string;
	let expectedHex: string;

	if (hash.startsWith("pbkdf2$")) {
		const [, iterationsPart, saltPart, hashPart] = hash.split("$");
		iterations = Number.parseInt(iterationsPart ?? "", 10);
		salt = saltPart ?? "";
		expectedHex = hashPart ?? "";

		if (!Number.isFinite(iterations) || iterations < 1) return false;
	} else {
		// Legacy format `<hashHex>.<salt>` (no iteration count embedded).
		const [legacyHash, legacySalt] = hash.split(".");
		iterations = LEGACY_PBKDF2_ITERATIONS;
		salt = legacySalt ?? "";
		expectedHex = legacyHash ?? "";
	}

	const expectedBuffer = Buffer.from(expectedHex, "hex");
	const actualBuffer = crypto.pbkdf2Sync(suppliedPassword, salt, iterations, KEY_LENGTH, DIGEST);

	if (expectedBuffer.length !== actualBuffer.length) return false;

	return crypto.timingSafeEqual(expectedBuffer, actualBuffer);
};
