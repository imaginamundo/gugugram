import { db } from "@infra/database";
import { ilike, and, ne, count } from "drizzle-orm";
import { users } from "@schemas/database";

const PAGE_SIZE = 20;

export const userSearchRepository = {
	countUsers: async (searchQuery: string, excludeUserId?: string): Promise<number> => {
		const conditions = [ilike(users.username, `%${searchQuery}%`)];
		if (excludeUserId) conditions.push(ne(users.id, excludeUserId));

		const result = await db
			.select({ count: count() })
			.from(users)
			.where(and(...conditions));
		return result[0]?.count ?? 0;
	},

	searchAuthenticatedUsers: async (searchQuery: string, currentUserId: string, page = 1) => {
		const offset = (page - 1) * PAGE_SIZE;
		return db.query.users.findMany({
			where: (user, { ilike, and, ne }) =>
				and(ilike(user.username, `%${searchQuery}%`), ne(user.id, currentUserId)),
			columns: {
				id: true,
				username: true,
				displayUsername: true,
				image: true,
			},
			with: {
				targetedFriends: {
					where: (uf, { eq }) => eq(uf.requestUserId, currentUserId),
					columns: { status: true },
				},
				requestedFriends: {
					where: (uf, { eq }) => eq(uf.targetUserId, currentUserId),
					columns: { status: true },
				},
			},
			limit: PAGE_SIZE,
			offset,
		});
	},

	searchGuestUsers: async (searchQuery: string, page = 1) => {
		const offset = (page - 1) * PAGE_SIZE;
		return db.query.users.findMany({
			where: (user, { ilike }) => ilike(user.username, `%${searchQuery}%`),
			columns: {
				id: true,
				username: true,
				displayUsername: true,
				image: true,
			},
			limit: PAGE_SIZE,
			offset,
		});
	},
};
