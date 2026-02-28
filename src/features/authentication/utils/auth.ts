import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@database/postgres";
import * as schema from "@database/schema"; // Importe o schema todo
import { username } from "better-auth/plugins";
import { hashPassword, validatePassword } from "./password";
import { sendEmail } from "./mail";

export const auth = betterAuth({
	baseURL: import.meta.env.PUBLIC_BASE_URL,
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
			await sendEmail(user.email, url, token);
		},
	},
	plugins: [
		username({
			minUsernameLength: 1,
			maxUsernameLength: 32,
		}),
	],
});
