import { db } from "@infra/database";
import {
	imagePostComments,
	imagePosts,
	messages,
	moderationReports,
	users,
	type reportTargetTypes,
} from "@schemas/database";
import { eq } from "drizzle-orm";

type TargetType = (typeof reportTargetTypes)[number];

export const moderationRepository = {
	/**
	 * Returns the author user id of the reported entity (or null if the entity
	 * doesn't exist). Used by the service to enforce "can't report your own
	 * content" and to validate the target before persisting the report.
	 */
	resolveTargetAuthor: async (
		targetType: TargetType,
		targetId: string,
	): Promise<{ authorId: string } | null> => {
		switch (targetType) {
			case "image_post": {
				const row = await db.query.imagePosts.findFirst({
					where: eq(imagePosts.id, targetId),
					columns: { authorId: true },
				});
				return row ? { authorId: row.authorId } : null;
			}
			case "image_post_comment": {
				const row = await db.query.imagePostComments.findFirst({
					where: eq(imagePostComments.id, targetId),
					columns: { authorId: true },
				});
				return row ? { authorId: row.authorId } : null;
			}
			case "message": {
				const row = await db.query.messages.findFirst({
					where: eq(messages.id, targetId),
					columns: { authorId: true },
				});
				return row ? { authorId: row.authorId } : null;
			}
			case "user": {
				const row = await db.query.users.findFirst({
					where: eq(users.id, targetId),
					columns: { id: true },
				});
				return row ? { authorId: row.id } : null;
			}
		}
	},

	insertReport: async (params: {
		reporterId: string;
		targetType: TargetType;
		targetId: string;
		reason?: string;
	}) => {
		await db.insert(moderationReports).values({
			reporterId: params.reporterId,
			targetType: params.targetType,
			targetId: params.targetId,
			reason: params.reason,
		});
	},

	resolveUserByUsername: async (username: string): Promise<{ id: string } | null> => {
		const row = await db.query.users.findFirst({
			where: eq(users.username, username),
			columns: { id: true },
		});
		return row ?? null;
	},
};
