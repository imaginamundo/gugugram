import { defineAction } from "astro:actions";
import { z } from "astro/zod";
import { parseSchema } from "@utils/validation";
import { withAuth } from "@utils/action-guard";
import {
	processAndUploadImagePost,
	removeImagePost,
	addImageComment,
	removeImageComment,
} from "@services/imagePost";
import { trackServerEvent, flushServerEvents } from "@observability/tracking-server";
import { ImagePostErrors } from "@customTypes/errors";

const UploadImageSchema = z.object({
	image: z.instanceof(File),
	description: z.string().max(500, "Descrição muito longa.").optional(),
});

export const uploadImagePost = defineAction({
	accept: "form",
	handler: withAuth(async (input: FormData, _, session) => {
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
				let message: string;
				switch (error.message) {
					case ImagePostErrors.FILE_TOO_LARGE:
						message = "Imagem muito grande. O tamanho máximo é 60KB.";
						break;
					case ImagePostErrors.INVALID_IMAGE_FILE:
						message = "Arquivo de imagem inválido ou corrompido.";
						break;
					case ImagePostErrors.INVALID_IMAGE_DIMENSIONS:
						message =
							"Tamanho de imagem incompatível. Use dimensões quadradas: 5, 10, 15, 30 ou 60px.";
						break;
					case ImagePostErrors.UPLOAD_FAILED:
						message = "Erro ao enviar a imagem para o servidor.";
						break;
					case ImagePostErrors.DB_INSERT_FAILED:
						message = "Erro ao salvar a imagem. Tente novamente.";
						break;
					default:
						message = error.message;
				}
				return { success: false as const, error: message };
			}
			return { success: false as const, error: "Erro interno." };
		}
	}),
});

const DeleteImageSchema = z.object({
	id: z.string(),
	imageUrl: z.string(),
});

export const deleteImagePost = defineAction({
	accept: "form",
	handler: withAuth(async (input: FormData, _, session) => {
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
				let message: string;
				switch (error.message) {
					case ImagePostErrors.INVALID_IMAGE_URL:
						message = "URL de imagem inválida.";
						break;
					case ImagePostErrors.POST_NOT_FOUND_OR_FORBIDDEN:
						message = "Imagem não encontrada ou sem permissão para exclusão.";
						break;
					default:
						message = error.message;
				}
				return { success: false as const, error: message };
			}
			return { success: false as const, error: "Erro interno." };
		}
	}),
});

const SendImagePostCommentSchema = z.object({
	imageId: z.string().min(1, "ID da imagem é obrigatório"),
	body: z.string().min(1, "O comentário não pode estar vazio").max(500, "Comentário muito longo"),
});

export const sendImagePostComment = defineAction({
	accept: "form",
	handler: withAuth(async (input: FormData, _, session) => {
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
				let message: string;
				switch (error.message) {
					case ImagePostErrors.COMMENT_INVALID:
						message = "Comentário inválido.";
						break;
					case ImagePostErrors.POST_NOT_FOUND:
						message = "Post não encontrado.";
						break;
					default:
						message = error.message;
				}
				return { success: false as const, error: message };
			}
			return { success: false as const, error: "Erro interno." };
		}
	}),
});

const DeleteImagePostCommentSchema = z.object({
	commentId: z.string().min(1, "ID do comentário é obrigatório"),
});

export const deleteImagePostComment = defineAction({
	accept: "form",
	handler: withAuth(async (input: FormData, _, session) => {
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
				let message: string;
				switch (error.message) {
					case ImagePostErrors.COMMENT_NOT_FOUND:
						message = "Comentário não encontrado.";
						break;
					case ImagePostErrors.COMMENT_NOT_AUTHORIZED:
						message = "Você não tem permissão para apagar este comentário.";
						break;
					default:
						message = error.message;
				}
				return { success: false as const, error: message };
			}
			return { success: false as const, error: "Erro interno." };
		}
	}),
});
