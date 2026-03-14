import { db } from "@lib/database";
import { messages, users } from "@schemas/database";
import { and, eq, or, desc } from "drizzle-orm";

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

	deleteMessageByIdAndUser: async (messageId: string, userId: string) => {
		return db
			.delete(messages)
			.where(
				and(
					eq(messages.id, messageId),
					or(eq(messages.receiverId, userId), eq(messages.authorId, userId)),
				),
			);
	},

	updateLastCheckedAt: async (userId: string, date: Date) => {
		return db.update(users).set({ lastCheckedMessagesAt: date }).where(eq(users.id, userId));
	},
};
