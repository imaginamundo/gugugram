import { defineAction } from "astro:actions";
import { z } from "astro/zod";
import { parseSchema } from "@utils/validation";
import {
	processAndUploadImagePost,
	removeImagePost,
	addImageComment,
	removeImageComment,
} from "@services/imagePost";
import { trackServerEvent, flushServerEvents } from "@lib/tracking-server";

const UploadImageSchema = z.object({
	image: z.instanceof(File),
	description: z.string().max(500, "Descrição muito longa.").optional(),
});

export const uploadImagePost = defineAction({
	accept: "form",
	handler: async (input, context) => {
		const session = context.locals.user;
		if (!session) return { success: false as const, error: "Não autenticado." };

		const { fields, success: schemaSuccess } = parseSchema(input, UploadImageSchema);
		if (!schemaSuccess) return { success: false as const, error: "Dados inválidos." };

		try {
			const imageUrl = await processAndUploadImagePost(
				session.id,
				fields.image,
				fields.description,
			);
			trackServerEvent({
				distinctId: session.username ?? session.id,
				event: "image_uploaded",
				properties: { has_description: !!fields.description },
			});

			await flushServerEvents();

			return {
				success: true as const,
				username: session.username,
				imageUrl,
			};
		} catch (error) {
			if (error instanceof Error) {
				return { success: false as const, error: error.message };
			}
			return { success: false as const, error: "Erro interno ao processar a imagem." };
		}
	},
});

const DeleteImageSchema = z.object({
	id: z.string(),
	imageUrl: z.string(),
});

export const deleteImagePost = defineAction({
	accept: "form",
	handler: async (input, context) => {
		const session = context.locals.user;
		if (!session) return { success: false as const, error: "Não autorizado." };

		const { fields, success: schemaSuccess } = parseSchema(input, DeleteImageSchema);
		if (!schemaSuccess) return { success: false as const, error: "Dados inválidos." };

		try {
			await removeImagePost(session.id, fields.id, fields.imageUrl);
			trackServerEvent({
				distinctId: session.username ?? session.id,
				event: "image_post_deleted",
				properties: { post_id: fields.id },
			});

			await flushServerEvents();

			return { success: true as const };
		} catch (error) {
			if (error instanceof Error) {
				return { success: false as const, error: error.message };
			}
			return { success: false as const, error: "Erro interno ao tentar deletar a imagem." };
		}
	},
});

const SendImagePostCommentSchema = z.object({
	imageId: z.string().min(1, "ID da imagem é obrigatório"),
	body: z.string().min(1, "O comentário não pode estar vazio").max(500, "Comentário muito longo"),
});

export const sendImagePostComment = defineAction({
	accept: "form",
	handler: async (input, context) => {
		const session = context.locals.user;
		if (!session) return { success: false as const, error: "Não autenticado." };

		const { fields, success: schemaSuccess } = parseSchema(input, SendImagePostCommentSchema);
		if (!schemaSuccess) return { success: false as const, error: "Dados inválidos." };

		try {
			await addImageComment(session.id, fields.imageId, fields.body);
			trackServerEvent({
				distinctId: session.username ?? session.id,
				event: "send_comment",
				properties: { image_id: fields.imageId },
			});

			await flushServerEvents();

			return { success: true as const };
		} catch (error) {
			if (error instanceof Error) {
				return { success: false as const, error: error.message };
			}
			return { success: false as const, error: "Erro interno ao enviar comentário." };
		}
	},
});

const DeleteImagePostCommentSchema = z.object({
	commentId: z.string().min(1, "ID do comentário é obrigatório"),
});

export const deleteImagePostComment = defineAction({
	accept: "form",
	handler: async (input, context) => {
		const session = context.locals.user;
		if (!session) return { success: false as const, error: "Não autenticado." };

		const { fields, success: schemaSuccess } = parseSchema(input, DeleteImagePostCommentSchema);
		if (!schemaSuccess) return { success: false as const, error: "Dados inválidos." };

		try {
			await removeImageComment(session.id, fields.commentId);
			trackServerEvent({
				distinctId: session.username ?? session.id,
				event: "delete_comment",
				properties: { comment_id: fields.commentId },
			});

			await flushServerEvents();

			return { success: true as const };
		} catch (error) {
			if (error instanceof Error) {
				return { success: false as const, error: error.message };
			}
			return { success: false as const, error: "Erro interno ao apagar comentário." };
		}
	},
});
