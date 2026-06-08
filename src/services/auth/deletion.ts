import { db } from "@infra/database";
import { accounts, users } from "@schemas/database";
import { eq, and } from "drizzle-orm";
import { validatePassword } from "@utils/password.ts";
import { AccountDeletionErrors } from "@customTypes/errors";

const CREDENTIAL_PROVIDER_ID = "credential";

/**
 * Verifies the supplied password against the user's stored credential and
 * permanently deletes the user record. All owned content (posts, comments,
 * messages, friendships) cascades via the `onDelete: "cascade"` FKs in the
 * schema, as do sessions and the `accounts` row that holds the password
 * hash — so by the time this returns, the cookie still in flight no longer
 * matches a real session and the next request goes back to the login page.
 */
export async function deleteOwnAccount(userId: string, password: string): Promise<void> {
	const account = await db.query.accounts.findFirst({
		where: and(eq(accounts.userId, userId), eq(accounts.providerId, CREDENTIAL_PROVIDER_ID)),
		columns: { password: true },
	});

	if (!account?.password) {
		throw new Error(AccountDeletionErrors.WRONG_PASSWORD);
	}

	if (!validatePassword(account.password, password)) {
		throw new Error(AccountDeletionErrors.WRONG_PASSWORD);
	}

	const result = await db.delete(users).where(eq(users.id, userId));
	if (!result) {
		throw new Error(AccountDeletionErrors.DELETION_FAILED);
	}
}
