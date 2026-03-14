import { defineAction } from "astro:actions";
import { z } from "astro/zod";
import { parseSchema } from "@utils/validation";

import {
	processFriendRequest,
	acceptPendingFriendRequest,
	deleteFriendship,
} from "@services/user/friends";

const FriendshipSchema = z.object({
	targetUserId: z.string().min(1),
});

export const sendFriendRequest = defineAction({
	accept: "form",
	handler: async (input, context) => {
		const session = context.locals.user;
		if (!session) return { success: false as const, error: "Não autorizado" };

		const { fields, success: schemaSuccess } = parseSchema(input, FriendshipSchema);
		if (!schemaSuccess) return { success: false as const, error: "Dados inválidos." };

		try {
			const resultingStatus = await processFriendRequest(session.id, fields.targetUserId);

			return { success: true as const, status: resultingStatus };
		} catch (error) {
			if (error instanceof Error && error.message === "INVALID_ACTION") {
				return {
					success: false as const,
					error: "Você não pode enviar uma solicitação para si mesmo.",
				};
			}
			return { success: false as const, error: "Erro ao enviar solicitação" };
		}
	},
});

export const acceptFriendRequest = defineAction({
	accept: "form",
	handler: async (input, context) => {
		const session = context.locals.user;
		if (!session) return { success: false as const, error: "Não autorizado" };

		const { fields, success: schemaSuccess } = parseSchema(input, FriendshipSchema);
		if (!schemaSuccess) return { success: false as const, error: "Dados inválidos." };

		try {
			await acceptPendingFriendRequest(session.id, fields.targetUserId);
			return { success: true as const };
		} catch {
			return { success: false as const, error: "Erro ao aceitar solicitação" };
		}
	},
});

export const removeFriendship = defineAction({
	accept: "form",
	handler: async (input, context) => {
		const session = context.locals.user;
		if (!session) return { success: false as const, error: "Não autorizado" };

		const { fields, success: schemaSuccess } = parseSchema(input, FriendshipSchema);
		if (!schemaSuccess) return { success: false as const, error: "Dados inválidos." };

		try {
			await deleteFriendship(session.id, fields.targetUserId);
			return { success: true as const };
		} catch {
			return { success: false as const, error: "Erro ao remover amizade" };
		}
	},
});
