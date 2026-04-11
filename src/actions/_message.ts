import { defineAction } from "astro:actions";
import { z } from "astro/zod";
import { parseSchema } from "@utils/validation";
import { withAuth } from "@utils/action-guard";

import { processAndSendMessage, deleteMessage, updateLastCheckedMessages } from "@services/message";
import { MessageErrors } from "@customTypes/errors";
import { trackServerEvent, flushServerEvents } from "@observability/tracking-server";

const SendMessageSchema = z.object({
	receiverId: z.string(),
	body: z.string().min(1, "A mensagem precisa existir").max(1000, "Mensagem muito longa"),
});

export const sendMessage = defineAction({
	accept: "form",
	handler: withAuth(async (input: FormData, context, session) => {
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
	}),
});

const RemoveMessageSchema = z.object({
	messageId: z.string(),
});

export const removeMessage = defineAction({
	accept: "form",
	handler: withAuth(async (input: FormData, context, session) => {
		const { fields, success: schemaSuccess } = parseSchema(input, RemoveMessageSchema);
		if (!schemaSuccess) return { success: false as const, error: "Dados inválidos." };

		try {
			await deleteMessage(session.id, fields.messageId);
			return { success: true as const };
		} catch (error) {
			if (error instanceof Error) {
				if (error.message === MessageErrors.MESSAGE_NOT_FOUND)
					return { success: false as const, error: "Mensagem não encontrada." };
				if (error.message === MessageErrors.FORBIDDEN)
					return { success: false as const, error: "Sem permissão para remover esta mensagem." };
			}
			return { success: false as const, error: "Erro interno ao remover mensagem." };
		}
	}),
});

export const markMessagesAsRead = defineAction({
	accept: "json",
	handler: withAuth(async (_, context, session) => {
		try {
			await updateLastCheckedMessages(session.id);
			return { success: true as const };
		} catch (error) {
			console.error("Erro ao marcar mensagens como lidas:", error);
			return { success: false as const, error: "Erro interno" };
		}
	}),
});
