import { db } from "@lib/database";

export const userSearchRepository = {
	searchAuthenticatedUsers: async (searchQuery: string, currentUserId: string) => {
		return db.query.users.findMany({
			where: (user, { ilike, and, ne }) =>
				and(ilike(user.username, `%${searchQuery}%`), ne(user.id, currentUserId)),
			columns: {
				id: true,
				username: true,
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
			limit: 20,
		});
	},

	searchGuestUsers: async (searchQuery: string) => {
		return db.query.users.findMany({
			where: (user, { ilike }) => ilike(user.username, `%${searchQuery}%`),
			columns: {
				id: true,
				username: true,
				image: true,
			},
			limit: 20,
		});
	},
};
