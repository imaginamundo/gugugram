import sharp from "sharp";
import { defineAction } from "astro:actions";
import { z } from "astro:schema";
import { eq } from "drizzle-orm";
import { db } from "@database/postgres";
import { users } from "@database/schema";
import { utapi } from "@utils/uploadthing";
import { parseSchema } from "@utils/validation";

const UpdateProfileSchema = z.object({
	profileImage: z.instanceof(File).optional(),
	description: z.string().max(500).optional(),
	username: z.string().min(3),
	email: z.string().email(),
});

export const updateProfile = defineAction({
	accept: "form",
	handler: async (input, context) => {
		const session = context.locals.user;
		if (!session) {
			return {
				success: false,
				error: "Não autorizado.",
			};
		}

		const { fields, success: schemaSuccess } = parseSchema(input, UpdateProfileSchema);
		if (!schemaSuccess) throw new Error("Dados inválidos.");

		const currentUser = await db.query.users.findFirst({
			where: eq(users.id, session.id),
		});

		const updateData: Partial<typeof users.$inferInsert> = {
			description: fields.description,
			username: fields.username,
			displayUsername: fields.username,
			email: fields.email,
		};

		let oldImageKeyToDelete: string | null = null;

		if (fields.profileImage && fields.profileImage.size > 0) {
			if (fields.profileImage.size > 4000000) {
				console.log("size");
				return {
					success: false as const,
					error: "A imagem de perfil é muito pesada. Máximo de 4MB.",
				};
			}

			try {
				const arrayBuffer = await fields.profileImage.arrayBuffer();
				const buffer = Buffer.from(arrayBuffer);

				const processedBuffer = await sharp(buffer)
					.resize(30, 30, {
						fit: "cover",
						position: "centre",
					})
					.png({ quality: 80 })
					.toBuffer();

				const originalName = fields.profileImage.name.split(".").shift() || "avatar";
				const newFilename = `${originalName}_30x30.png`;

				const fileToUpload = new File([new Uint8Array(processedBuffer)], newFilename, {
					type: "image/png",
				});

				const upload = await utapi.uploadFiles(fileToUpload);

				if (!upload.data?.ufsUrl) {
					console.log("subir");

					return {
						success: false as const,
						error: "Erro ao subir a nova imagem de perfil.",
					};
				}

				updateData.image = upload.data.ufsUrl;

				if (currentUser?.image) {
					oldImageKeyToDelete = currentUser.image.split("/").pop() || null;
				}
			} catch (processingError) {
				console.error(processingError);
				console.log("process");

				return {
					success: false as const,
					error:
						"Erro ao processar a imagem de perfil. Certifique-se de que é um arquivo de imagem válido.",
				};
			}
		}

		try {
			await db.update(users).set(updateData).where(eq(users.id, session.id));

			if (oldImageKeyToDelete) {
				utapi
					.deleteFiles(oldImageKeyToDelete)
					.catch((e) => console.error("Erro ao deletar imagem antiga do UT:", e));
			}
		} catch (error: any) {
			if (error.code === "23505") {
				console.log("usuario ja tem");

				return {
					success: false as const,
					error: "Este nome de usuário ou e-mail já está em uso.",
				};
			}
			return {
				success: false as const,
				error: "Erro interno ao atualizar o perfil.",
			};
		}

		return { success: true as const };
	},
});

export const removeProfileImage = defineAction({
	accept: "form",
	handler: async (_, context) => {
		const session = context.locals.user;
		if (!session) throw new Error("Não autorizado");

		const currentUser = await db.query.users.findFirst({
			where: eq(users.id, session.id),
			columns: { image: true },
		});

		if (!currentUser?.image) {
			return {
				success: false,
				error: "Você não possui uma foto de perfil para remover.",
			};
		}

		const imageKey = currentUser.image.split("/").pop();

		try {
			if (imageKey) {
				await utapi.deleteFiles(imageKey);
			}

			await db.update(users).set({ image: null }).where(eq(users.id, session.id));

			return { success: true };
		} catch (error) {
			console.error(error);
			return {
				success: false,
				error: "Erro interno ao tentar remover a foto de perfil.",
			};
		}
	},
});
