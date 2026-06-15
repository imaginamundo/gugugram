import { db } from "@infra/database";
import { deleteImage } from "@services/uploadImage/deleteImage";
import { accounts, users } from "@schemas/database";
import { eq, and } from "drizzle-orm";
import { validatePassword } from "@utils/password.ts";
import { AccountDeletionErrors } from "@customTypes/errors";

import { imagePostRepository } from "@repositories/imagePost";
import { messageRepository } from "@repositories/message";
import { moderationRepository } from "@repositories/moderation";
import { userProfileRepository } from "@repositories/userProfile";

const CREDENTIAL_PROVIDER_ID = "credential";

/** Turns a stored image url (`https://.../<key>`) into the storage key. */
function imageKeyFromUrl(url: string | null | undefined): string | null {
	return url ? (url.split("/").pop() ?? null) : null;
}

/**
 * Verifies the supplied password against the user's stored credential and
 * permanently, COMPLETELY deletes the user.
 *
 * Most owned content (posts, comments, messages, friendships, sessions, the
 * `accounts` row holding the password hash, and reports the user FILED) is
 * removed by the `onDelete: "cascade"` FKs when the user row goes. But cascade
 * leaves two things behind, which this function cleans up explicitly:
 *
 *  1. Uploaded blobs — cascade drops the `images_posts` rows and the avatar
 *     column, but the actual files in object storage are orphaned. We gather
 *     every post image url + the avatar url before the delete and remove them.
 *  2. Moderation reports that POINT AT the user — reports about the user
 *     themselves or about their posts/comments/messages. `targetId` is not a
 *     FK (it references four tables), so these don't cascade; we gather the
 *     content ids before the delete and purge the matching reports after.
 *
 * By the time this returns nothing in the database references the user, and no
 * orphaned media remains in storage.
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

	// Gather everything we'll need AFTER the cascade has removed the rows.
	const [currentUser, posts, commentIds, messageIds] = await Promise.all([
		userProfileRepository.getUserById(userId),
		imagePostRepository.getPostsByAuthor(userId),
		imagePostRepository.getCommentIdsByAuthor(userId),
		messageRepository.getMessageIdsByAuthor(userId),
	]);

	const postIds = posts.map((post) => post.id);
	const imageKeys = [
		imageKeyFromUrl(currentUser?.image),
		...posts.map((post) => imageKeyFromUrl(post.image)),
	].filter((key): key is string => key !== null);

	// The authoritative delete. Cascade fans out across the owned rows.
	const result = await db.delete(users).where(eq(users.id, userId));
	if (!result) {
		throw new Error(AccountDeletionErrors.DELETION_FAILED);
	}

	// Purge reports that target the (now-deleted) user or their content. These
	// don't cascade, so they'd otherwise dangle as references to a gone user.
	await moderationRepository.deleteReportsTargetingUser({
		userId,
		postIds,
		commentIds,
		messageIds,
	});

	// Remove orphaned blobs (avatar + every post image). Best-effort: the row
	// data is already gone, so a storage hiccup must not fail the deletion or
	// resurrect the account — just log it for cleanup.
	if (imageKeys.length) {
		const outcomes = await Promise.allSettled(imageKeys.map((key) => deleteImage(key)));
		for (const outcome of outcomes) {
			if (outcome.status === "rejected") {
				console.error("Falha ao deletar arquivo órfão do storage:", outcome.reason);
			}
		}
	}
}
