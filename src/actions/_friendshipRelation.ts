import { defineAction } from "astro:actions";
import { z } from "astro/zod";
import { parseSchema } from "@utils/validation";
import { withAuth } from "@utils/action-guard";

import {
	processFriendRequest,
	acceptPendingFriendRequest,
	deleteFriendship,
} from "@services/user/friends";
import { trackServerEvent, flushServerEvents } from "@lib/tracking-server";

const FriendshipSchema = z.object({
	targetUserId: z.string().min(1),
});

export const sendFriendRequest = defineAction({
	accept: "form",
	handler: withAuth(async (input: FormData, context, session) => {
		const { fields, success: schemaSuccess } = parseSchema(input, FriendshipSchema);
		if (!schemaSuccess) return { success: false as const, error: "Dados inválidos." };

		try {
			const resultingStatus = await processFriendRequest(session.id, fields.targetUserId);

			trackServerEvent({
				distinctId: session.username ?? session.id,
				event: "friend_request_sent",
				properties: { status: resultingStatus, target_user_id: fields.targetUserId },
			});

			await flushServerEvents();

			return { success: true as const, status: resultingStatus };
		} catch (error) {
			if (error instanceof Error) {
				if (error.message === "INVALID_ACTION") {
					return {
						success: false as const,
						error: "Você não pode enviar uma solicitação para si mesmo.",
					};
				}
				return { success: false as const, error: error.message };
			}
			return { success: false as const, error: "Erro interno." };
		}
	}),
});

export const acceptFriendRequest = defineAction({
	accept: "form",
	handler: withAuth(async (input: FormData, context, session) => {
		const { fields, success: schemaSuccess } = parseSchema(input, FriendshipSchema);
		if (!schemaSuccess) return { success: false as const, error: "Dados inválidos." };

		try {
			await acceptPendingFriendRequest(session.id, fields.targetUserId);
			trackServerEvent({
				distinctId: session.username ?? session.id,
				event: "friend_request_accepted",
				properties: { target_user_id: fields.targetUserId },
			});

			await flushServerEvents();

			return { success: true as const };
		} catch {
			return { success: false as const, error: "Erro ao aceitar solicitação" };
		}
	}),
});

export const removeFriendship = defineAction({
	accept: "form",
	handler: withAuth(async (input: FormData, context, session) => {
		const { fields, success: schemaSuccess } = parseSchema(input, FriendshipSchema);
		if (!schemaSuccess) return { success: false as const, error: "Dados inválidos." };

		try {
			await deleteFriendship(session.id, fields.targetUserId);
			trackServerEvent({
				distinctId: session.username ?? session.id,
				event: "friendship_removed",
				properties: { target_user_id: fields.targetUserId },
			});

			await flushServerEvents();

			return { success: true as const };
		} catch {
			return { success: false as const, error: "Erro ao remover amizade" };
		}
	}),
});
