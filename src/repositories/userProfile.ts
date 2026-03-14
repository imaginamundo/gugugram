import { db } from "@lib/database";
import { users, messages, userFriends } from "@schemas/database";
import { and, eq, gt, or, count } from "drizzle-orm";

export type UpdateUserPayload = Partial<typeof users.$inferInsert>;

export const userProfileRepository = {
	getUserByUsername: async (username: string) => {
		return db.query.users.findFirst({
			where: eq(users.username, username),
			columns: {
				id: true,
				username: true,
				image: true,
				description: true,
				lastCheckedMessagesAt: true,
			},
		});
	},

	getUserById: async (userId: string) => {
		return db.query.users.findFirst({
			where: eq(users.id, userId),
		});
	},

	getFriendshipBetweenUsers: async (userId1: string, userId2: string) => {
		return db.query.userFriends.findFirst({
			where: or(
				and(eq(userFriends.targetUserId, userId1), eq(userFriends.requestUserId, userId2)),
				and(eq(userFriends.targetUserId, userId2), eq(userFriends.requestUserId, userId1)),
			),
		});
	},

	getAcceptedFriendsCount: async (userId: string) => {
		const result = await db
			.select({ count: count() })
			.from(userFriends)
			.where(
				and(
					eq(userFriends.status, "accepted"),
					or(eq(userFriends.requestUserId, userId), eq(userFriends.targetUserId, userId)),
				),
			);
		return result[0].count;
	},

	getTotalMessagesCount: async (userId: string) => {
		const result = await db
			.select({ count: count() })
			.from(messages)
			.where(eq(messages.receiverId, userId));
		return result[0].count;
	},

	getPendingRequestsCount: async (userId: string) => {
		const result = await db
			.select({ count: count() })
			.from(userFriends)
			.where(and(eq(userFriends.status, "pending"), eq(userFriends.targetUserId, userId)));
		return result[0].count;
	},

	getUnreadMessagesCount: async (userId: string, lastCheckedAt: Date | null) => {
		const result = await db
			.select({ count: count() })
			.from(messages)
			.where(
				and(
					eq(messages.receiverId, userId),
					lastCheckedAt ? gt(messages.createdAt, lastCheckedAt) : undefined,
				),
			);
		return result[0].count;
	},

	updateUser: async (userId: string, data: UpdateUserPayload) => {
		return db.update(users).set(data).where(eq(users.id, userId));
	},
};
