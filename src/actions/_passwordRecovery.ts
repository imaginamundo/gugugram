import { defineAction } from "astro:actions";
import { z } from "astro:schema";
import { auth } from "@auth/auth";
import { parseSchema } from "@utils/validation";

const RequestPasswordResetSchema = z.object({
	email: z.string().email("E-mail inválido"),
});

export const requestPasswordReset = defineAction({
	accept: "form",
	handler: async (input, context) => {
		const { fields, success: schemaSuccess } = parseSchema(input, RequestPasswordResetSchema);
		if (!schemaSuccess) throw new Error("Dados inválidos.");

		await auth.api.requestPasswordReset({
			headers: context.request.headers,
			body: {
				email: fields.email,
				redirectTo: `${import.meta.env.PUBLIC_BASE_URL}/nova-senha`,
			},
		});

		return {
			success: true,
			message: "Se o e-mail existir, um link foi enviado para você inserir uma nova senha.",
		};
	},
});

const ResetPasswordSchema = z.object({
	newPassword: z.string().min(8, "A senha deve ter 8 caracteres"),
	token: z.string(),
});

export const resetPassword = defineAction({
	accept: "form",
	handler: async (input, context) => {
		const { fields, success: schemaSuccess } = parseSchema(input, ResetPasswordSchema);
		if (!schemaSuccess) return { success: false, error: "Token inválido." };

		try {
			await auth.api.resetPassword({
				headers: context.request.headers,
				body: {
					newPassword: fields.newPassword,
					token: fields.token,
				},
			});

			return { success: true };
		} catch (error) {
			return { success: false, error: "Erro ao redefinir senha." };
		}
	},
});
