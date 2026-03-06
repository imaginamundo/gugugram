import { desc, eq } from "drizzle-orm";
import { db } from "@database/postgres";
import { messages, users } from "@database/schema";
import type { ProfileUser } from "./user";

export async function getMessages(username: string) {
	const messagesData = await db.query.users.findFirst({
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

	if (!messagesData) return { messagesReceived: [] };

	return messagesData;
}

export type MessagesType = Awaited<ReturnType<typeof getMessages>>;

export async function updateLastRead(
	userId: string,
	session: App.Locals["user"],
	unreadMessagesCount: number = 0,
) {
	if (!session) return;

	if (session.id === userId && unreadMessagesCount > 0) {
		await db
			.update(users)
			.set({ lastCheckedMessagesAt: new Date() })
			.where(eq(users.id, session.id));
	}
}
