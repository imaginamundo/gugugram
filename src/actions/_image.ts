import { defineAction } from "astro:actions";
import { z } from "astro:schema";
import { and, eq, desc } from "drizzle-orm";
import { db } from "@database/postgres";
import { images } from "@database/schema";
import { utapi } from "@utils/uploadthing";
import { parseSchema } from "@utils/validation";

const RATE_LIMIT_MS = 5000;

const UploadImageSchema = z.object({
	image: z.instanceof(File),
});

export const uploadImage = defineAction({
	accept: "form",
	handler: async (input, context) => {
		const session = context.locals.user;
		if (!session) throw new Error("Não autenticado");

		const { fields, success: schemaSuccess } = parseSchema(input, UploadImageSchema);
		if (!schemaSuccess) throw new Error("Dados inválidos.");

		const lastImage = await db.query.images.findFirst({
			where: eq(images.authorId, session.id),
			orderBy: [desc(images.createdAt)],
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

		if (file.size > 60000) {
			throw new Error("Imagem muito grande. O tamanho máximo é 60KB.");
		}

		try {
			const upload = await utapi.uploadFiles(file);

			if (!upload.data?.ufsUrl) {
				throw new Error("Erro ao subir a imagem para o servidor.");
			}

			await db.insert(images).values({
				authorId: session.id,
				image: upload.data?.ufsUrl,
			});

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

export const deleteImage = defineAction({
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
				.delete(images)
				.where(and(eq(images.id, fields.id), eq(images.authorId, session.id)))
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
