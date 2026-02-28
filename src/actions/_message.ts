import { defineAction } from "astro:actions";
import { z } from "astro:schema";
import { and, eq, or, desc } from "drizzle-orm";
import sanitizeHtml from "sanitize-html";
import { db } from "@database/postgres";
import { messages } from "@database/schema";
import { parseSchema } from "@utils/validation";

const RATE_LIMIT_MS = 5000;

const SendMessageSchema = z.object({
	receiverId: z.string(),
	body: z.string().min(1, "A mensagem precisa existir").max(1000, "Mensagem muito longa"),
});

export const sendMessage = defineAction({
	accept: "form",
	handler: async (input, context) => {
		const session = context.locals.user;
		if (!session) throw new Error("Não autenticado");

		const { fields, success: schemaSuccess } = parseSchema(input, SendMessageSchema);
		if (!schemaSuccess) throw new Error("Dados inválidos.");

		const lastMessage = await db.query.messages.findFirst({
			where: eq(messages.authorId, session.id),
			orderBy: [desc(messages.createdAt)],
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

		const sanitizedBody = sanitizeHtml(fields.body);
		if (!sanitizedBody) throw new Error("Mensagem vazia");

		if (session.id === fields.receiverId) {
			throw new Error("Não pode enviar mensagem para si");
		}

		await db.insert(messages).values({
			authorId: session.id,
			receiverId: fields.receiverId,
			body: sanitizedBody,
		});

		return { success: true };
	},
});

const RemoveMessageSchema = z.object({
	messageId: z.string(),
});

export const removeMessage = defineAction({
	accept: "form",
	handler: async (input, context) => {
		const user = context.locals.user;
		if (!user) throw new Error("Não autenticado");

		const { fields, success: schemaSuccess } = parseSchema(input, RemoveMessageSchema);
		if (!schemaSuccess) throw new Error("Dados inválidos.");

		await db
			.delete(messages)
			.where(
				and(
					eq(messages.id, fields.messageId),
					or(eq(messages.receiverId, user.id), eq(messages.authorId, user.id)),
				),
			);

		return { success: true };
	},
});
