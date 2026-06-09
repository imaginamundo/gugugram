import { db } from "@infra/database";
import { messages, users } from "@schemas/database";
import { eq, desc } from "drizzle-orm";

export const messageRepository = {
	getMessagesByUsername: async (username: string) => {
		return db.query.users.findFirst({
			where: (user, { eq }) => eq(user.username, username),
			columns: {},
			with: {
				messagesReceived: {
					orderBy: [desc(messages.createdAt)],
					columns: {
						id: true,
						body: true,
						createdAt: true,
					},
					with: {
						author: {
							columns: {
								id: true,
								username: true,
								image: true,
							},
						},
					},
				},
			},
		});
	},

	getLatestMessageByAuthor: async (authorId: string) => {
		return db.query.messages.findFirst({
			where: eq(messages.authorId, authorId),
			orderBy: [desc(messages.createdAt)],
		});
	},

	insertMessage: async (authorId: string, receiverId: string, body: string) => {
		return db.insert(messages).values({ authorId, receiverId, body });
	},

	getMessageById: async (messageId: string) => {
		return db.query.messages.findFirst({ where: eq(messages.id, messageId) });
	},

	// Used by account deletion: ids of messages authored by the user, gathered
	// before the cascade removes the rows, so we can purge moderation reports
	// that target those messages (reports don't FK targetId, so they don't
	// cascade).
	getMessageIdsByAuthor: async (authorId: string): Promise<string[]> => {
		const rows = await db.query.messages.findMany({
			where: eq(messages.authorId, authorId),
			columns: { id: true },
		});
		return rows.map((row) => row.id);
	},

	deleteMessageById: async (messageId: string) => {
		return db.delete(messages).where(eq(messages.id, messageId));
	},

	updateLastCheckedAt: async (userId: string, date: Date) => {
		return db.update(users).set({ lastCheckedMessagesAt: date }).where(eq(users.id, userId));
	},
};
