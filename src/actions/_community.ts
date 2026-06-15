import { defineAction } from "astro:actions";
import { z } from "astro/zod";
import { parseSchema } from "@utils/validation";
import { withAuth } from "@utils/action-guard";
import { checkRateLimit } from "@utils/rate-limit";
import {
	createCommunity as createCommunityService,
	removeCommunity,
	promoteToAdmin,
	removeAdmin as removeAdminService,
	transferOwnership as transferOwnershipService,
	subscribeToCommunity,
	unsubscribeFromCommunity,
	createPost as createPostService,
	removePost,
	createResponse as createResponseService,
	removeResponse,
	deleteCommunityImage,
	updateCommunity,
} from "@services/community";
import { CommunityErrors, ImageUploadErrors } from "@customTypes/errors";
import { communityRepository } from "@repositories/community";

const CreateCommunitySchema = z.object({
	title: z.string().min(3).max(100),
	description: z.string().max(500).optional(),
	image: z.string().optional(),
});

const CreatePostSchema = z.object({
	communityId: z.string().min(1),
	title: z.string().min(3).max(150),
	content: z.string().min(1).max(5000),
});

const CreateResponseSchema = z.object({
	postId: z.string().min(1),
	content: z.string().min(1).max(2000),
});

const CommunityIdSchema = z.object({ communityId: z.string().min(1) });
const PostIdSchema = z.object({ postId: z.string().min(1) });
const ResponseIdSchema = z.object({ responseId: z.string().min(1) });

const AdminActionSchema = z.object({
	communityId: z.string().min(1),
	targetUserId: z.string().min(1),
});

const TransferOwnershipSchema = z.object({
	communityId: z.string().min(1),
	newOwnerId: z.string().min(1),
});

const UpdateCommunitySchema = CreateCommunitySchema.pick({
	description: true,
	image: true,
}).refine((data) => Object.keys(data).length > 0, {
	message: "Pelo menos um campo deve ser informado.",
});

function mapCommunityError(message: string): string {
	switch (message) {
		case CommunityErrors.TITLE_TOO_SHORT:
			return "O título da comunidade deve ter pelo menos 3 caracteres.";
		case CommunityErrors.TITLE_TOO_LONG:
			return "O título da comunidade deve ter no máximo 100 caracteres.";
		case CommunityErrors.TITLE_ALREADY_EXISTS:
			return "Já existe uma comunidade com este título.";
		case CommunityErrors.DESCRIPTION_TOO_LONG:
			return "A descrição deve ter no máximo 500 caracteres.";
		case CommunityErrors.NOT_FOUND:
			return "Comunidade não encontrada.";
		case CommunityErrors.NOT_OWNER:
			return "Apenas o dono da comunidade pode realizar esta ação.";
		case CommunityErrors.NOT_SUBSCRIBER:
			return "Você precisa assinar a comunidade para publicar.";
		case CommunityErrors.ALREADY_SUBSCRIBER:
			return "Você já assina esta comunidade.";
		case CommunityErrors.ALREADY_ADMIN:
			return "Este usuário já é administrador da comunidade.";
		case CommunityErrors.NOT_ADMIN:
			return "Este usuário não é administrador da comunidade.";
		case CommunityErrors.TRANSFER_TARGET_NOT_ADMIN:
			return "O destinatário precisa ser administrador da comunidade.";
		case CommunityErrors.POST_NOT_FOUND:
			return "Post não encontrado.";
		case CommunityErrors.POST_TITLE_TOO_SHORT:
			return "O título do post deve ter pelo menos 3 caracteres.";
		case CommunityErrors.POST_TITLE_TOO_LONG:
			return "O título do post deve ter no máximo 150 caracteres.";
		case CommunityErrors.POST_CONTENT_INVALID:
			return "O conteúdo do post deve ter entre 1 e 5000 caracteres.";
		case CommunityErrors.POST_NOT_AUTHORIZED:
			return "Você não tem permissão para excluir este post.";
		case CommunityErrors.RESPONSE_NOT_FOUND:
			return "Resposta não encontrada.";
		case CommunityErrors.RESPONSE_CONTENT_INVALID:
			return "O conteúdo da resposta deve ter entre 1 e 2000 caracteres.";
		case CommunityErrors.RESPONSE_NOT_AUTHORIZED:
			return "Você não tem permissão para excluir esta resposta.";
		case CommunityErrors.UPLOAD_FAILED:
			return "Erro ao enviar a imagem. Tente novamente.";
		case CommunityErrors.NO_IMAGE_TO_REMOVE:
			return "Imagem inexistente.";

		case ImageUploadErrors.FILE_TOO_LARGE:
			return "A imagem deve ter no máximo 1MB.";
		case ImageUploadErrors.INVALID_IMAGE_FILE:
			return "Formato de imagem inválido. Use PNG, JPG ou JPEG.";
		case ImageUploadErrors.INVALID_IMAGE_DIMENSIONS:
			return "Dimensões da imagem não permitidas. Verifique as dimensões aceitas.";
		case ImageUploadErrors.UPLOAD_FAILED:
			return "Erro ao enviar a imagem. Tente novamente.";
		default:
			return message;
	}
}

const RATE_LIMIT_MS = 5000;

export const createCommunity = defineAction({
	accept: "form",
	handler: withAuth(async (input: FormData, _, session) => {
		const { fields, success: schemaSuccess } = parseSchema(input, CreateCommunitySchema);
		if (!schemaSuccess) return { success: false as const, error: "Dados inválidos." };

		try {
			const result = await createCommunityService(
				session.id,
				fields.title,
				fields.description ?? null,
				fields.image ?? null,
			);

			return { success: true as const, id: result.id, slug: result.slug };
		} catch (error) {
			if (error instanceof Error) {
				return { success: false as const, error: mapCommunityError(error.message) };
			}
			return { success: false as const, error: "Erro interno." };
		}
	}),
});

export const deleteCommunity = defineAction({
	accept: "form",
	handler: withAuth(async (_, context, session) => {
		const communitySlug = context.params.slug;
		if (!communitySlug) return { success: false as const, error: "Dados inválidos." };

		try {
			await removeCommunity(session.id, communitySlug);
			return { success: true as const };
		} catch (error) {
			if (error instanceof Error) {
				return { success: false as const, error: mapCommunityError(error.message) };
			}
			return { success: false as const, error: "Erro interno." };
		}
	}),
});

export const promoteAdmin = defineAction({
	accept: "form",
	handler: withAuth(async (input: FormData, context, session) => {
		const { fields, success: schemaSuccess } = parseSchema(input, AdminActionSchema);
		if (!schemaSuccess) return { success: false as const, error: "Dados inválidos." };

		const communitySlug = context.params.slug;
		if (!communitySlug) return { success: false as const, error: "Dados inválidos." };

		try {
			await promoteToAdmin(session.id, fields.communityId, fields.targetUserId);
			return { success: true as const };
		} catch (error) {
			if (error instanceof Error) {
				return { success: false as const, error: mapCommunityError(error.message) };
			}
			return { success: false as const, error: "Erro interno." };
		}
	}),
});

export const removeAdmin = defineAction({
	accept: "form",
	handler: withAuth(async (input: FormData, _, session) => {
		const { fields, success: schemaSuccess } = parseSchema(input, AdminActionSchema);
		if (!schemaSuccess) return { success: false as const, error: "Dados inválidos." };

		try {
			await removeAdminService(session.id, fields.communityId, fields.targetUserId);
			return { success: true as const };
		} catch (error) {
			if (error instanceof Error) {
				return { success: false as const, error: mapCommunityError(error.message) };
			}
			return { success: false as const, error: "Erro interno." };
		}
	}),
});

export const transferOwnership = defineAction({
	accept: "form",
	handler: withAuth(async (input: FormData, context, session) => {
		const communitySlug = context.params.slug;
		if (!communitySlug) return { success: false as const, error: "Dados inválidos." };
		const { fields, success: schemaSuccess } = parseSchema(input, TransferOwnershipSchema);
		if (!schemaSuccess) return { success: false as const, error: "Dados inválidos." };

		try {
			await transferOwnershipService(session.id, fields.communityId, fields.newOwnerId);
			return { success: true as const };
		} catch (error) {
			if (error instanceof Error) {
				return { success: false as const, error: mapCommunityError(error.message) };
			}
			return { success: false as const, error: "Erro interno." };
		}
	}),
});

export const subscribe = defineAction({
	accept: "form",
	handler: withAuth(async (input: FormData, _, session) => {
		const { fields, success: schemaSuccess } = parseSchema(input, CommunityIdSchema);
		if (!schemaSuccess) return { success: false as const, error: "Dados inválidos." };

		try {
			await subscribeToCommunity(session.id, fields.communityId);
			return { success: true as const };
		} catch (error) {
			if (error instanceof Error) {
				return { success: false as const, error: mapCommunityError(error.message) };
			}
			return { success: false as const, error: "Erro interno." };
		}
	}),
});

export const unsubscribe = defineAction({
	accept: "form",
	handler: withAuth(async (input: FormData, _, session) => {
		const { fields, success: schemaSuccess } = parseSchema(input, CommunityIdSchema);
		if (!schemaSuccess) return { success: false as const, error: "Dados inválidos." };

		try {
			await unsubscribeFromCommunity(session.id, fields.communityId);
			return { success: true as const };
		} catch (error) {
			if (error instanceof Error) {
				return { success: false as const, error: mapCommunityError(error.message) };
			}
			return { success: false as const, error: "Erro interno." };
		}
	}),
});

export const createPost = defineAction({
	accept: "form",
	handler: withAuth(async (input: FormData, _, session) => {
		const { fields, success: schemaSuccess } = parseSchema(input, CreatePostSchema);
		if (!schemaSuccess) return { success: false as const, error: "Dados inválidos." };

		try {
			const result = await createPostService(
				session.id,
				fields.communityId,
				fields.title,
				fields.content,
			);
			return { success: true as const, id: result.id };
		} catch (error) {
			if (error instanceof Error) {
				return { success: false as const, error: mapCommunityError(error.message) };
			}
			return { success: false as const, error: "Erro interno." };
		}
	}),
});

export const deletePost = defineAction({
	accept: "form",
	handler: withAuth(async (input: FormData, _, session) => {
		const { fields, success: schemaSuccess } = parseSchema(input, PostIdSchema);
		if (!schemaSuccess) return { success: false as const, error: "Dados inválidos." };

		try {
			await removePost(session.id, fields.postId);
			return { success: true as const };
		} catch (error) {
			if (error instanceof Error) {
				return { success: false as const, error: mapCommunityError(error.message) };
			}
			return { success: false as const, error: "Erro interno." };
		}
	}),
});

export const createResponse = defineAction({
	accept: "form",
	handler: withAuth(async (input: FormData, _, session) => {
		const { fields, success: schemaSuccess } = parseSchema(input, CreateResponseSchema);
		if (!schemaSuccess) return { success: false as const, error: "Dados inválidos." };

		const lastPostResponse = await communityRepository.getLatestResponseByAuthor(
			fields.postId,
			session.id,
		);

		checkRateLimit(lastPostResponse?.createdAt, RATE_LIMIT_MS, "Excesso de respostas");

		try {
			await createResponseService(session.id, fields.postId, fields.content);
			return { success: true as const };
		} catch (error) {
			if (error instanceof Error) {
				return { success: false as const, error: mapCommunityError(error.message) };
			}
			return { success: false as const, error: "Erro interno." };
		}
	}),
});

export const deleteResponse = defineAction({
	accept: "form",
	handler: withAuth(async (input: FormData, _, session) => {
		const { fields, success: schemaSuccess } = parseSchema(input, ResponseIdSchema);
		if (!schemaSuccess) return { success: false as const, error: "Dados inválidos." };

		try {
			await removeResponse(session.id, fields.responseId);
			return { success: true as const };
		} catch (error) {
			if (error instanceof Error) {
				return { success: false as const, error: mapCommunityError(error.message) };
			}
			return { success: false as const, error: "Erro interno." };
		}
	}),
});

export const removeCommunityImage = defineAction({
	accept: "form",
	handler: withAuth(async (_, context, session) => {
		const communitySlug = context.params.slug;
		if (!communitySlug) return { success: false as const, error: "Dados inválidos." };

		try {
			await deleteCommunityImage(session.id, communitySlug);
			return { success: true as const };
		} catch (error) {
			if (error instanceof Error) {
				return {
					success: false as const,
					error: mapCommunityError(error.message),
				};
			}
			return {
				success: false as const,
				error: "Erro interno.",
			};
		}
	}),
});

export const editCommunity = defineAction({
	accept: "form",
	handler: withAuth(async (input: FormData, context, session) => {
		const communitySlug = context.params.slug;
		if (!communitySlug) return { success: false as const, error: "Dados inválidos." };

		const { fields, success: schemaSuccess } = parseSchema(input, UpdateCommunitySchema);
		if (!schemaSuccess) return { success: false as const, error: "Dados inválidos." };

		try {
			await updateCommunity(session.id, communitySlug, fields);
			return { success: true as const };
		} catch (error) {
			if (error instanceof Error) {
				return {
					success: false as const,
					error: mapCommunityError(error.message),
				};
			}
			return {
				success: false as const,
				error: "Erro interno.",
			};
		}
	}),
});
