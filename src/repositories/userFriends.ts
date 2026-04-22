import { db } from "@infra/database";
import { users, userFriends } from "@schemas/database";
import { and, eq, or } from "drizzle-orm";

export const userFriendsRepository = {
	getUserWithFriendships: async (userId: string) => {
		return db.query.users.findFirst({
			where: eq(users.id, userId),
			columns: {},
			with: {
				targetedFriends: {
					where: (uf, { inArray }) => inArray(uf.status, ["accepted", "pending"]),
					columns: { status: true },
					with: {
						requestUser: {
							columns: { id: true, username: true, displayUsername: true, image: true },
						},
					},
				},
				requestedFriends: {
					where: (uf, { eq }) => eq(uf.status, "accepted"),
					columns: { status: true },
					with: {
						targetUser: {
							columns: { id: true, username: true, displayUsername: true, image: true },
						},
					},
				},
			},
		});
	},

	getReverseRequest: async (requesterId: string, targetId: string) => {
		return db.query.userFriends.findFirst({
			where: and(
				eq(userFriends.requestUserId, targetId),
				eq(userFriends.targetUserId, requesterId),
			),
		});
	},

	acceptRequestById: async (id: string) => {
		return db.update(userFriends).set({ status: "accepted" }).where(eq(userFriends.id, id));
	},

	createPendingRequest: async (requesterId: string, targetId: string) => {
		return db
			.insert(userFriends)
			.values({
				requestUserId: requesterId,
				targetUserId: targetId,
				status: "pending",
			})
			.onConflictDoNothing({
				target: [userFriends.requestUserId, userFriends.targetUserId],
			});
	},

	acceptRequestByUsers: async (requesterId: string, targetId: string) => {
		return db
			.update(userFriends)
			.set({ status: "accepted" })
			.where(
				and(eq(userFriends.requestUserId, targetId), eq(userFriends.targetUserId, requesterId)),
			);
	},

	deleteFriendshipBetweenUsers: async (userId1: string, userId2: string) => {
		return db
			.delete(userFriends)
			.where(
				or(
					and(eq(userFriends.requestUserId, userId1), eq(userFriends.targetUserId, userId2)),
					and(eq(userFriends.requestUserId, userId2), eq(userFriends.targetUserId, userId1)),
				),
			);
	},
};
