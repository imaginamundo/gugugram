import { db } from "@infra/database";
import { messages, users } from "@schemas/database";
import { eq, desc } from "drizzle-orm";
import { descNullsLast } from "@utils/order";
import { alias } from "drizzle-orm/pg-core";

export const messageRepository = {
	// Written as an explicit join rather than a relational query because Drizzle
	// does not support `offset` on a nested relation, and this page needs a
	// bounded window instead of every message the user has ever received.
	//
	// Filtering on `receiverId` rather than joining out to `users.username` is
	// what lets `messages_receiver_created_idx` drive the query: with the join,
	// the planner has no constant to probe the index with and scans every
	// message in the table before applying the LIMIT.
	getMessagesByReceiverId: async (receiverId: string, limit: number, offset: number) => {
		const author = alias(users, "author");

		return db
			.select({
				id: messages.id,
				body: messages.body,
				createdAt: messages.createdAt,
				author: {
					id: author.id,
					username: author.username,
					image: author.image,
				},
			})
			.from(messages)
			.innerJoin(author, eq(messages.authorId, author.id))
			.where(eq(messages.receiverId, receiverId))
			.orderBy(descNullsLast(messages.createdAt))
			.limit(limit)
			.offset(offset);
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
