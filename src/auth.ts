import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { username } from "better-auth/plugins";
import { db } from "@infra/database";
import { sendEmail } from "@email/email";
import * as schema from "@schemas/database";
import { hashPassword, validatePassword } from "@utils/password.ts";
import {
	resetPasswordEmailTemplate,
	resetPasswordTextTemplate,
} from "@email/templates/resetPassword";

export const auth = betterAuth({
	baseURL: import.meta.env.SITE,
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
			verify: async ({ hash, password }: { hash: string; password: string }) =>
				validatePassword(hash, password),
		},
		minPasswordLength: 1,
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
	plugins: [
		username({
			minUsernameLength: 1,
			maxUsernameLength: 32,
		}),
	],
});
