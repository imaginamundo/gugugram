import { defineAction } from "astro:actions";
import { z } from "astro:schema";
import { db } from "@database/postgres";
import { userFriends } from "@database/schema";
import { and, eq, or } from "drizzle-orm";

const friendshipSchema = z.object({
	targetUserId: z.string().min(1),
});

export const sendFriendRequest = defineAction({
	accept: "form",
	input: friendshipSchema,
	handler: async (input, context) => {
		const session = context.locals.user;
		if (!session) throw new Error("Não autorizado");

		if (session.id === input.targetUserId) throw new Error("Ação inválida");

		try {
			await db.insert(userFriends).values({
				requestUserId: session.id,
				targetUserId: input.targetUserId,
				status: "pending",
			});
			return { success: true };
		} catch (e) {
			return { success: false, error: "Erro ao enviar solicitação" };
		}
	},
});

export const acceptFriendRequest = defineAction({
	accept: "form",
	input: friendshipSchema,
	handler: async (input, context) => {
		const session = context.locals.user;
		if (!session) throw new Error("Não autorizado");

		try {
			await db
				.update(userFriends)
				.set({ status: "accepted" })
				.where(
					and(
						eq(userFriends.requestUserId, input.targetUserId),
						eq(userFriends.targetUserId, session.id),
					),
				);
			return { success: true };
		} catch (e) {
			return { success: false, error: "Erro ao aceitar solicitação" };
		}
	},
});

export const removeFriendship = defineAction({
	accept: "form",
	input: friendshipSchema,
	handler: async (input, context) => {
		const session = context.locals.user;
		if (!session) throw new Error("Não autorizado");

		try {
			await db
				.delete(userFriends)
				.where(
					or(
						and(
							eq(userFriends.requestUserId, session.id),
							eq(userFriends.targetUserId, input.targetUserId),
						),
						and(
							eq(userFriends.requestUserId, input.targetUserId),
							eq(userFriends.targetUserId, session.id),
						),
					),
				);
			return { success: true };
		} catch (e) {
			return { success: false, error: "Erro ao remover amizade" };
		}
	},
});
