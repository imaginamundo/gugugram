import { defineAction } from "astro:actions";
import { z } from "astro:schema";
import { and, eq, or, desc } from "drizzle-orm";
import sanitizeHtml from "sanitize-html";
import { db } from "@database/postgres";
import { messages } from "@database/schema";

const RATE_LIMIT_MS = 5000;

export const sendMessage = defineAction({
	accept: "form",
	input: z.object({
		receiverId: z.string(),
		body: z.string().min(1, "A mensagem precisa existir").max(1000, "Mensagem muito longa"),
	}),
	handler: async (input, context) => {
		const session = context.locals.user;
		if (!session) throw new Error("Não autenticado");

		const lastMessage = await db.query.messages.findFirst({
			where: eq(messages.authorId, session.id),
			orderBy: [desc(messages.createdAt)], // Pega a mais recente
		});

		if (lastMessage) {
			const now = new Date().getTime();
			const lastMessageTime = lastMessage.createdAt.getTime();
			const timeDiff = now - lastMessageTime;

			if (timeDiff < RATE_LIMIT_MS) {
				const timeLeft = Math.ceil((RATE_LIMIT_MS - timeDiff) / 1000);
				throw new Error(
					`Calma lá! Aguarde mais ${timeLeft} segundo(s) para enviar outra mensagem.`,
				);
			}
		}

		const sanitizedBody = sanitizeHtml(input.body);
		if (!sanitizedBody) throw new Error("Mensagem vazia");

		if (session.id === input.receiverId) {
			throw new Error("Não pode enviar mensagem para si");
		}

		await db.insert(messages).values({
			authorId: session.id,
			receiverId: input.receiverId,
			body: sanitizedBody,
		});

		return { success: true };
	},
});

export const removeMessage = defineAction({
	accept: "form",
	input: z.object({
		messageId: z.string(),
	}),
	handler: async (input, context) => {
		const user = context.locals.user;
		if (!user) throw new Error("Não autenticado");

		await db
			.delete(messages)
			.where(
				and(
					eq(messages.id, input.messageId),
					or(eq(messages.receiverId, user.id), eq(messages.authorId, user.id)),
				),
			);

		return { success: true };
	},
});
