import { desc } from "drizzle-orm";
import { db } from "@database/postgres";
import { messages } from "@database/schema";

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
