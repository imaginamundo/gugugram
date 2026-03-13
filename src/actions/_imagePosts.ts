import { defineAction } from "astro:actions";
import { z } from "astro/zod";
import { and, eq, desc } from "drizzle-orm";
import { imageSize } from "image-size";
import sanitizeHtml from "sanitize-html";
import { db } from "@database/postgres";
import { imagePostComments, imagePosts } from "@database/schema";
import { utapi } from "@utils/uploadthing";
import { parseSchema } from "@utils/validation";

const RATE_LIMIT_MS = 5000;
const ALLOWED_DIMENSIONS = [5, 10, 15, 30, 60];

const UploadImageSchema = z.object({
	image: z.instanceof(File),
	description: z.string().max(500, "Descrição muito longa.").optional(),
});

export const uploadImagePost = defineAction({
	accept: "form",
	handler: async (input, context) => {
		const session = context.locals.user;
		if (!session) throw new Error("Não autenticado");

		const { fields, success: schemaSuccess } = parseSchema(input, UploadImageSchema);
		if (!schemaSuccess) throw new Error("Dados inválidos.");

		if (fields.image.size > 60000) {
			throw new Error("Imagem muito grande. O tamanho máximo é 60KB.");
		}

		const lastImage = await db.query.imagePosts.findFirst({
			where: eq(imagePosts.authorId, session.id),
			orderBy: [desc(imagePosts.createdAt)],
		});

		if (lastImage) {
			const now = new Date().getTime();
			const lastImageTime = lastImage.createdAt.getTime();
			const timeDiff = now - lastImageTime;

			if (timeDiff < RATE_LIMIT_MS) {
				const timeLeft = Math.ceil((RATE_LIMIT_MS - timeDiff) / 1000);
				throw new Error(`Aguarde mais ${timeLeft} segundo(s) antes de enviar outra imagem.`);
			}
		}

		const file = fields.image;

		const arrayBuffer = await file.arrayBuffer();
		const dimensions = imageSize(Buffer.from(arrayBuffer));

		if (!dimensions || dimensions.width === undefined || dimensions.height === undefined) {
			throw new Error("Arquivo de imagem inválido ou corrompido.");
		}

		const isSquare = dimensions.width === dimensions.height;
		const isAllowedDimension =
			ALLOWED_DIMENSIONS.includes(dimensions.width) &&
			ALLOWED_DIMENSIONS.includes(dimensions.height);

		if (!isSquare || !isAllowedDimension) {
			throw new Error("Tamanho de imagem imcompatível.");
		}

		try {
			const fileToUpload = new File([arrayBuffer], file.name, { type: file.type });
			const upload = await utapi.uploadFiles(fileToUpload);

			if (!upload.data?.ufsUrl) {
				throw new Error("Erro ao subir a imagem para o servidor.");
			}

			const sanitizedDescription = fields.description ? sanitizeHtml(fields.description) : null;

			try {
				await db.insert(imagePosts).values({
					authorId: session.id,
					description: sanitizedDescription,
					image: upload.data?.ufsUrl,
				});
			} catch (dbError) {
				const imageKey = upload.data.ufsUrl.split("/").pop();
				if (imageKey) await utapi.deleteFiles(imageKey);

				throw new Error("Erro ao salvar no banco de dados. Upload cancelado.");
			}

			return {
				success: true,
				username: session.username,
				imageUrl: upload.data?.ufsUrl,
			};
		} catch (e) {
			console.error(e);
			if (e instanceof Error) throw e;
			throw new Error("Erro interno ao processar a imagem.");
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
		if (!session) throw new Error("Não autorizado");

		const { fields, success: schemaSuccess } = parseSchema(input, DeleteImageSchema);
		if (!schemaSuccess) throw new Error("Dados inválidos.");

		const imageKey = fields.imageUrl.split("/").pop();
		if (!imageKey) throw new Error("URL de imagem inválida");

		try {
			const deletedRow = await db
				.delete(imagePosts)
				.where(and(eq(imagePosts.id, fields.id), eq(imagePosts.authorId, session.id)))
				.returning();

			if (deletedRow.length === 0) {
				throw new Error("Imagem não encontrada ou sem permissão para exclusão.");
			}

			await utapi.deleteFiles(imageKey);

			return { success: true };
		} catch (e) {
			console.error(e);
			if (e instanceof Error) throw e;
			throw new Error("Erro interno ao tentar deletar a imagem.");
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
		if (!session) throw new Error("Não autenticado.");

		const { fields, success: schemaSuccess } = parseSchema(input, SendImagePostCommentSchema);
		if (!schemaSuccess) throw new Error("Dados inválidos.");

		const lastComment = await db.query.imagePostComments.findFirst({
			where: eq(imagePostComments.authorId, session.id),
			orderBy: [desc(imagePostComments.createdAt)],
		});

		if (lastComment) {
			const now = new Date().getTime();
			const lastCommentTime = lastComment.createdAt.getTime();
			const timeDiff = now - lastCommentTime;

			if (timeDiff < RATE_LIMIT_MS) {
				const timeLeft = Math.ceil((RATE_LIMIT_MS - timeDiff) / 1000);
				throw new Error(
					`Calma lá! Aguarde mais ${timeLeft} segundo(s) para enviar outro comentário.`,
				);
			}
		}

		const sanitizedBody = sanitizeHtml(fields.body);
		if (!sanitizedBody) throw new Error("Comentário inválido.");

		const postExists = await db.query.imagePosts.findFirst({
			where: eq(imagePosts.id, fields.imageId),
			columns: { id: true },
		});

		if (!postExists) throw new Error("Post não encontrado.");

		await db.insert(imagePostComments).values({
			imageId: fields.imageId,
			authorId: session.id,
			body: sanitizedBody,
		});

		return { success: true };
	},
});

const DeleteImagePostCommentSchema = z.object({
	commentId: z.string().min(1, "ID do comentário é obrigatório"),
});

export const deleteImagePostComment = defineAction({
	accept: "form",
	handler: async (input, context) => {
		const session = context.locals.user;
		if (!session) throw new Error("Não autenticado.");

		const { fields, success: schemaSuccess } = parseSchema(input, DeleteImagePostCommentSchema);
		if (!schemaSuccess) throw new Error("Dados inválidos.");

		const commentData = await db.query.imagePostComments.findFirst({
			where: eq(imagePostComments.id, fields.commentId),
			with: {
				post: {
					columns: { authorId: true },
				},
			},
		});

		if (!commentData) throw new Error("Comentário não encontrado.");

		const isCommentAuthor = commentData.authorId === session.id;
		const isPhotoOwner = commentData.post.authorId === session.id;

		if (!isCommentAuthor && !isPhotoOwner) {
			throw new Error("Não autorizado para apagar este comentário");
		}

		await db.delete(imagePostComments).where(eq(imagePostComments.id, fields.commentId));

		return { success: true };
	},
});
