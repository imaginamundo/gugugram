import { defineAction } from "astro:actions";
import { z } from "astro/zod";
import { parseSchema } from "@utils/validation";
import { withAuth } from "@utils/action-guard";

import { updateProfileData, removeProfileImageFromUser } from "@services/user/profile";
import { trackServerEvent, flushServerEvents } from "@observability/tracking-server";
import { ProfileErrors } from "@customTypes/errors";

const UpdateProfileSchema = z.object({
	profileImage: z.string().optional(),
	description: z.string().max(500).optional(),
	username: z.string().min(3),
	email: z.email(),
});

export const updateProfile = defineAction({
	accept: "form",
	handler: withAuth(async (input: FormData, _, session) => {
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
					case ProfileErrors.IMAGE_UPLOAD_FAILED:
						return { success: false as const, error: "Erro ao subir a nova imagem de perfil." };
					case ProfileErrors.IMAGE_PROCESSING_FAILED:
						return {
							success: false as const,
							error: "Erro ao processar a imagem. Certifique-se de que é válida.",
						};
					case ProfileErrors.UNIQUE_CONSTRAINT_VIOLATION:
						return {
							success: false as const,
							error: "Este nome de usuário ou e-mail já está em uso.",
						};
				}
			}
			return { success: false as const, error: "Erro interno ao atualizar o perfil." };
		}
	}),
});

export const removeProfileImage = defineAction({
	accept: "form",
	handler: withAuth(async (_, __, session) => {
		try {
			await removeProfileImageFromUser(session.id);
			return { success: true as const };
		} catch (error) {
			if (error instanceof Error && error.message === ProfileErrors.NO_IMAGE_TO_REMOVE) {
				return {
					success: false as const,
					error: "Você não possui uma foto de perfil para remover.",
				};
			}
			return { success: false as const, error: "Erro interno ao tentar remover a foto de perfil." };
		}
	}),
});
