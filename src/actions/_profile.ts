import { defineAction } from "astro:actions";
import { z } from "astro:schema";
import { eq } from "drizzle-orm";
import { db } from "@database/postgres";
import { users } from "@database/schema";
import { utapi } from "@utils/uploadthing";
import { parseSchema } from "@utils/validation";

const UpdateProfileSchema = z.object({
	profileImage: z.string().optional(),
	description: z.string().max(500).optional(),
	username: z.string().min(3),
	email: z.string().email(),
});

export const updateProfile = defineAction({
	accept: "form",
	handler: async (input, context) => {
		console.log({ input, context });
		const session = context.locals.user;
		if (!session) {
			return {
				success: false,
				error: "Não autorizado.",
			};
		}
		const { fields, success: schemaSuccess } = parseSchema(input, UpdateProfileSchema);
		if (!schemaSuccess) {
			return {
				success: false as const,
				error: "Erro ao validar dados.",
			};
		}

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

		if (fields.profileImage && fields.profileImage.includes(",")) {
			try {
				const base64Data = fields.profileImage.replace(/^data:image\/\w+;base64,/, "");
				const buffer = Buffer.from(base64Data, "base64");

				const originalName = fields.username || "avatar";
				const newFilename = `${originalName}_30x30.png`;

				const file = new File([buffer], newFilename, { type: "image/png" });

				const upload = await utapi.uploadFiles(file);

				if (!upload.data?.ufsUrl) {
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
			return {
				success: false,
				error: "Erro interno ao tentar remover a foto de perfil.",
			};
		}
	},
});

async function uploadBase64(base64String: string) {
	// 1. Remove the data URL prefix to get just the data
	const base64Data = base64String.replace(/^data:image\/\w+;base64,/, "");

	// 2. Convert Base64 to a Buffer
	const buffer = Buffer.from(base64Data, "base64");

	// 3. Create a File object (UploadThing requires a name and type)
	// Note: utapi.uploadFiles expects an array or a single file object
	const file = new File([buffer], "uploaded_file.png", { type: "image/png" });

	try {
		const response = await utapi.uploadFiles(file);
		return response;
	} catch (error) {
		console.log(error);
	}
}
