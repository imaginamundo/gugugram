import { defineAction } from "astro:actions";
import { z } from "astro/zod";
import { db } from "@database/postgres";
import { userFriends } from "@database/schema";
import { and, eq, or } from "drizzle-orm";
import { parseSchema } from "@utils/validation";

const FriendshipSchema = z.object({
	targetUserId: z.string().min(1),
});

export const sendFriendRequest = defineAction({
	accept: "form",
	handler: async (input, context) => {
		const session = context.locals.user;
		if (!session) throw new Error("Não autorizado");

		const { fields, success: schemaSuccess } = parseSchema(input, FriendshipSchema);
		if (!schemaSuccess) throw new Error("Dados inválidos.");

		if (session.id === fields.targetUserId) throw new Error("Ação inválida");

		try {
			const existingReverseRequest = await db.query.userFriends.findFirst({
				where: and(
					eq(userFriends.requestUserId, fields.targetUserId),
					eq(userFriends.targetUserId, session.id),
				),
			});

			if (existingReverseRequest) {
				await db
					.update(userFriends)
					.set({ status: "accepted" })
					.where(eq(userFriends.id, existingReverseRequest.id));

				return { success: true, status: "accepted" };
			}

			await db
				.insert(userFriends)
				.values({
					requestUserId: session.id,
					targetUserId: fields.targetUserId,
					status: "pending",
				})
				.onConflictDoNothing({
					target: [userFriends.requestUserId, userFriends.targetUserId],
				});
			return { success: true };
		} catch {
			return { success: false, error: "Erro ao enviar solicitação" };
		}
	},
});

export const acceptFriendRequest = defineAction({
	accept: "form",
	handler: async (input, context) => {
		const session = context.locals.user;
		if (!session) throw new Error("Não autorizado");

		const { fields, success: schemaSuccess } = parseSchema(input, FriendshipSchema);
		if (!schemaSuccess) throw new Error("Dados inválidos.");

		try {
			await db
				.update(userFriends)
				.set({ status: "accepted" })
				.where(
					and(
						eq(userFriends.requestUserId, fields.targetUserId),
						eq(userFriends.targetUserId, session.id),
					),
				);
			return { success: true };
		} catch {
			return { success: false, error: "Erro ao aceitar solicitação" };
		}
	},
});

export const removeFriendship = defineAction({
	accept: "form",
	handler: async (input, context) => {
		const session = context.locals.user;
		if (!session) throw new Error("Não autorizado");

		const { fields, success: schemaSuccess } = parseSchema(input, FriendshipSchema);
		if (!schemaSuccess) throw new Error("Dados inválidos.");

		try {
			await db
				.delete(userFriends)
				.where(
					or(
						and(
							eq(userFriends.requestUserId, session.id),
							eq(userFriends.targetUserId, fields.targetUserId),
						),
						and(
							eq(userFriends.requestUserId, fields.targetUserId),
							eq(userFriends.targetUserId, session.id),
						),
					),
				);
			return { success: true };
		} catch {
			return { success: false, error: "Erro ao remover amizade" };
		}
	},
});
