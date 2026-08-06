import crypto from "node:crypto";

/**
 * PBKDF2-HMAC-SHA512 work factor. OWASP's current guidance for SHA-512 is
 * 210,000 iterations.
 *
 * `KEY_LENGTH` is deliberately the native SHA-512 output size (64 bytes).
 * Asking PBKDF2 for a longer key does not make it stronger: the extra bytes
 * are independent blocks, so an attacker only has to derive the first 64
 * bytes to test a candidate password while we pay for all of them. The legacy
 * parameters below cost us eight blocks of work for the security of one.
 */
const ITERATIONS = 210_000;
const KEY_LENGTH = 64;
const SALT_BYTES = 32;
const DIGEST = "sha512";

/** `pbkdf2-sha512$<iterations>$<salt>$<hash>` — self-describing, so the work factor can move again later. */
const PREFIX = "pbkdf2-sha512";

/**
 * Two self-describing formats exist in the accounts table. `pbkdf2$` was an
 * interim step that raised the iteration count but kept the 512-byte key; its
 * rows still verify here and `needsRehash` marks them for upgrade on the next
 * successful sign-in. Both encode `<prefix>$<iterations>$<salt>$<hash>`, and
 * the key length is read back off the hash itself, so one parser covers both.
 */
const SELF_DESCRIBING_PREFIXES = [PREFIX, "pbkdf2"];

/** Hashes written before either of those: `<hash>.<salt>`, 10,000 iterations, 512-byte key. */
const LEGACY_ITERATIONS = 10_000;
const LEGACY_KEY_LENGTH = 512;

type StoredHash = {
	iterations: number;
	keyLength: number;
	salt: string;
	hash: Buffer;
};

/**
 * Returns `null` for anything we cannot read — a truncated row, a hash from
 * some other scheme, garbage. Callers treat that as "does not match" rather
 * than letting it become a 500.
 */
const parseStoredHash = (stored: string): StoredHash | null => {
	if (typeof stored !== "string") return null;

	if (SELF_DESCRIBING_PREFIXES.some((prefix) => stored.startsWith(`${prefix}$`))) {
		const [, rawIterations, salt, hex] = stored.split("$");
		const iterations = Number(rawIterations);

		if (!salt || !hex) return null;
		if (!Number.isInteger(iterations) || iterations < 1) return null;

		const hash = Buffer.from(hex, "hex");
		// `Buffer.from(…, "hex")` stops at the first invalid character instead
		// of throwing, so verify the round-trip before trusting the length.
		if (hash.length === 0 || hash.length * 2 !== hex.length) return null;

		return { iterations, keyLength: hash.length, salt, hash };
	}

	const [hex, salt] = stored.split(".");
	if (!hex || !salt) return null;

	const hash = Buffer.from(hex, "hex");
	if (hash.length !== LEGACY_KEY_LENGTH || hash.length * 2 !== hex.length) return null;

	return { iterations: LEGACY_ITERATIONS, keyLength: LEGACY_KEY_LENGTH, salt, hash };
};

export const hashPassword = (password: string) => {
	const salt = crypto.randomBytes(SALT_BYTES).toString("base64");
	const hash = crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, DIGEST);
	return `${PREFIX}$${ITERATIONS}$${salt}$${hash.toString("hex")}`;
};

export const validatePassword = (stored: string, suppliedPassword: string) => {
	const parsed = parseStoredHash(stored);
	if (!parsed) return false;

	const supplied = crypto.pbkdf2Sync(
		suppliedPassword,
		parsed.salt,
		parsed.iterations,
		parsed.keyLength,
		DIGEST,
	);

	// `timingSafeEqual` throws on a length mismatch. The lengths always agree
	// by construction, but a corrupt row must fail the login, not crash it.
	if (supplied.length !== parsed.hash.length) return false;

	return crypto.timingSafeEqual(parsed.hash, supplied);
};

/**
 * Whether a stored hash was written with weaker parameters than we use now.
 * Only meaningful after `validatePassword` has returned `true` — that is the
 * one moment we hold the plaintext and can write a stronger hash back.
 */
export const needsRehash = (stored: string) => {
	const parsed = parseStoredHash(stored);
	if (!parsed) return false;

	return parsed.iterations < ITERATIONS || parsed.keyLength !== KEY_LENGTH;
};
