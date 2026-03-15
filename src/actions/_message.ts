import { defineAction } from "astro:actions";
import { z } from "astro/zod";
import { parseSchema } from "@utils/validation";

import { processAndSendMessage, deleteMessage, updateLastCheckedMessages } from "@services/message";
import { trackServerEvent, flushServerEvents } from "@lib/tracking-server";

const SendMessageSchema = z.object({
	receiverId: z.string(),
	body: z.string().min(1, "A mensagem precisa existir").max(1000, "Mensagem muito longa"),
});

export const sendMessage = defineAction({
	accept: "form",
	handler: async (input, context) => {
		const session = context.locals.user;
		if (!session) return { success: false as const, error: "Não autenticado" };

		const { fields, success: schemaSuccess } = parseSchema(input, SendMessageSchema);
		if (!schemaSuccess) return { success: false as const, error: "Dados inválidos." };

		try {
			await processAndSendMessage(session.id, fields.receiverId, fields.body);
			trackServerEvent({
				distinctId: session.username ?? session.id,
				event: "message_sent",
			});

			await flushServerEvents();

			return { success: true as const };
		} catch (error) {
			if (error instanceof Error) {
				return { success: false as const, error: error.message };
			}
			return { success: false as const, error: "Erro interno ao enviar mensagem." };
		}
	},
});

const RemoveMessageSchema = z.object({
	messageId: z.string(),
});

export const removeMessage = defineAction({
	accept: "form",
	handler: async (input, context) => {
		const session = context.locals.user;
		if (!session) return { success: false as const, error: "Não autenticado" };

		const { fields, success: schemaSuccess } = parseSchema(input, RemoveMessageSchema);
		if (!schemaSuccess) return { success: false as const, error: "Dados inválidos." };

		try {
			await deleteMessage(session.id, fields.messageId);
			return { success: true as const };
		} catch {
			return { success: false as const, error: "Erro interno ao remover mensagem." };
		}
	},
});

export const markMessagesAsRead = defineAction({
	accept: "json",
	handler: async (_, context) => {
		const session = context.locals.user;
		if (!session) return { success: false as const, error: "Não autorizado" };

		try {
			await updateLastCheckedMessages(session.id);
			return { success: true as const };
		} catch (error) {
			console.error("Erro ao marcar mensagens como lidas:", error);
			return { success: false as const, error: "Erro interno" };
		}
	},
});
