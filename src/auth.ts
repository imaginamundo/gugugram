import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { username } from "better-auth/plugins";
import { eq } from "drizzle-orm";
import { AUTH_SECRET } from "astro:env/server";
import { db } from "@infra/database";
import { sendEmail } from "@email/email";
import * as schema from "@schemas/database";
import { hashPassword, needsRehash, validatePassword } from "@utils/password.ts";
import {
	resetPasswordEmailTemplate,
	resetPasswordTextTemplate,
} from "@email/templates/resetPassword";

const baseURL = import.meta.env.DEV ? "http://localhost:4321" : import.meta.env.SITE;

/**
 * Older accounts still carry a weaker hash — either the original
 * 10,000-iteration one or the interim `pbkdf2$` format, which raised the
 * iteration count but kept a 512-byte key. Better-Auth has no rehash hook, so
 * upgrade opportunistically the one moment we hold the plaintext: right after
 * a successful verify.
 *
 * The stored hash is unique per account (it embeds a random salt), so
 * matching on it targets exactly one row. Best effort by design — a failure
 * here must never block a login, and the next sign-in tries again. Nothing is
 * logged because `src/auth.ts` may not import the observability layer.
 */
const upgradeStoredHash = async (storedHash: string, password: string) => {
	try {
		await db
			.update(schema.accounts)
			.set({ password: hashPassword(password), updatedAt: new Date() })
			.where(eq(schema.accounts.password, storedHash));
	} catch {
		// Ignored on purpose — see above.
	}
};

export const auth = betterAuth({
	baseURL,
	secret: AUTH_SECRET,
	database: drizzleAdapter(db, {
		provider: "pg",
		schema: {
			user: schema.users,
			session: schema.sessions,
			account: schema.accounts,
			verification: schema.verifications,
		},
	}),
	emailAndPassword: {
		enabled: true,
		password: {
			hash: async (password: string) => hashPassword(password),
			verify: async ({ hash, password }: { hash: string; password: string }) => {
				if (!validatePassword(hash, password)) return false;
				if (needsRehash(hash)) await upgradeStoredHash(hash, password);
				return true;
			},
		},
		// Sign-in does not check this, so raising it cannot lock out an
		// existing account with a shorter password — it only applies to
		// registration, password reset and password change.
		minPasswordLength: 8,
		maxPasswordLength: 128,
		requireEmailVerification: false,
		sendResetPassword: async ({ user, url, token }) => {
			await sendEmail({
				to: user.email,
				subject: "Troque sua senha no Gugugram",
				text: resetPasswordTextTemplate(url, token),
				html: resetPasswordEmailTemplate(url, token),
			});
		},
	},
	rateLimit: {
		enabled: true,
		window: 60,
		max: 100,
	},
	plugins: [
		username({
			minUsernameLength: 1,
			maxUsernameLength: 32,
		}),
	],
});
