import { defineAction } from "astro:actions";
import { z } from "astro:schema";
import { and, eq, desc } from "drizzle-orm";
import { db } from "@database/postgres";
import { images } from "@database/schema";
import { utapi } from "@utils/uploadthing";
import { UTFile } from "uploadthing/server";

const RATE_LIMIT_MS = 5000;

export const uploadImage = defineAction({
	accept: "form",
	input: z.any(),
	handler: async (input, context) => {
		const session = context.locals.user;
		if (!session) throw new Error("Não autenticado");

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

		const file = input.image as File;

		if (!file || typeof file !== "object" || !("arrayBuffer" in file)) {
			throw new Error("O arquivo enviado é inválido.");
		}

		if (file.size > 60000) {
			throw new Error("Imagem muito grande. O tamanho máximo é 60KB.");
		}

		try {
			const utFile = new UTFile([await file.arrayBuffer()], file.name, { type: file.type });

			// const upload = await utapi.uploadFiles(utFile);

			// if (!upload.data?.ufsUrl) {
			// 	throw new Error("Erro ao subir a imagem para o servidor.");
			// }

			// await db.insert(images).values({
			// 	authorId: session.id,
			// 	image: upload.data.ufsUrl,
			// });

			// return {
			// 	success: true,
			// 	username: session.username,
			// 	imageUrl: upload.data.ufsUrl,
			// };

			return { debug: "success" };
		} catch (e) {
			console.error(e);
			throw new Error("Erro interno ao processar a imagem.");
		}
	},
});

export const deleteImage = defineAction({
	accept: "form",
	input: z.object({
		id: z.string(),
		imageUrl: z.string(),
	}),
	handler: async (input, context) => {
		const session = context.locals.user;
		if (!session) throw new Error("Não autorizado");

		const imageKey = input.imageUrl.split("/").pop();
		if (!imageKey) throw new Error("URL de imagem inválida");

		try {
			const deletedRow = await db
				.delete(images)
				.where(and(eq(images.id, input.id), eq(images.authorId, session.id)))
				.returning();

			if (deletedRow.length === 0) {
				throw new Error("Imagem não encontrada ou sem permissão para exclusão.");
			}

			await utapi.deleteFiles(imageKey);

			return { success: true };
		} catch (e) {
			console.error(e);
			throw new Error("Erro interno ao tentar deletar a imagem.");
		}
	},
});
