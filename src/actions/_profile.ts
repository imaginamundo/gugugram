import { defineAction } from "astro:actions";
import { z } from "astro/zod";
import { parseSchema } from "@utils/validation";

import { updateProfileData, removeProfileImageFromUser } from "@services/user/profile";
import { trackServerEvent, flushServerEvents } from "@lib/tracking-server";

const UpdateProfileSchema = z.object({
	profileImage: z.string().optional(),
	description: z.string().max(500).optional(),
	username: z.string().min(3),
	email: z.email(),
});

export const updateProfile = defineAction({
	accept: "form",
	handler: async (input, context) => {
		const session = context.locals.user;
		if (!session) return { success: false as const, error: "Não autorizado." };

		const { fields, success: schemaSuccess } = parseSchema(input, UpdateProfileSchema);
		if (!schemaSuccess) return { success: false as const, error: "Erro ao validar dados." };

		try {
			await updateProfileData(session.id, {
				username: fields.username,
				email: fields.email,
				description: fields.description,
				profileImage: fields.profileImage,
			});

			trackServerEvent({
				distinctId: session.username ?? session.id,
				event: "profile_updated",
				properties: {
					changed_username: fields.username !== session.username,
					has_description: !!fields.description,
					has_profile_image: !!fields.profileImage,
				},
			});

			await flushServerEvents();

			return { success: true as const };
		} catch (error) {
			if (error instanceof Error) {
				switch (error.message) {
					case "IMAGE_UPLOAD_FAILED":
						return { success: false as const, error: "Erro ao subir a nova imagem de perfil." };
					case "IMAGE_PROCESSING_FAILED":
						return {
							success: false as const,
							error: "Erro ao processar a imagem. Certifique-se de que é válida.",
						};
					case "UNIQUE_CONSTRAINT_VIOLATION":
						return {
							success: false as const,
							error: "Este nome de usuário ou e-mail já está em uso.",
						};
				}
			}
			return { success: false as const, error: "Erro interno ao atualizar o perfil." };
		}
	},
});

export const removeProfileImage = defineAction({
	accept: "form",
	handler: async (_, context) => {
		const session = context.locals.user;
		if (!session) throw new Error("Não autorizado");

		try {
			await removeProfileImageFromUser(session.id);
			return { success: true as const };
		} catch (error) {
			if (error instanceof Error && error.message === "NO_IMAGE_TO_REMOVE") {
				return {
					success: false as const,
					error: "Você não possui uma foto de perfil para remover.",
				};
			}
			return { success: false as const, error: "Erro interno ao tentar remover a foto de perfil." };
		}
	},
});
