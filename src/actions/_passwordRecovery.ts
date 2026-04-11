import { defineAction } from "astro:actions";
import { z } from "astro/zod";
import { parseSchema } from "@utils/validation";
import { sendPasswordResetEmail, performPasswordReset } from "@services/auth";
import { trackServerEvent, flushServerEvents } from "@observability/tracking-server";

const RequestPasswordResetSchema = z.object({
	email: z.email("E-mail inválido"),
});

export const requestPasswordReset = defineAction({
	accept: "form",
	handler: async (input, context) => {
		const { fields, success: schemaSuccess } = parseSchema(input, RequestPasswordResetSchema);
		if (!schemaSuccess) throw new Error("Dados inválidos.");

		try {
			await sendPasswordResetEmail(
				fields.email,
				`${import.meta.env.SITE}/nova-senha`,
				context.request.headers,
			);

			trackServerEvent({
				distinctId: fields.email,
				event: "password_reset_requested",
			});

			await flushServerEvents();

			return {
				success: true as const,
				message: "Se o e-mail existir, um link foi enviado para você cadastrar uma nova senha.",
			};
		} catch {
			return { success: false as const, error: "Erro ao solicitar redefinição." };
		}
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
		if (!schemaSuccess) return { success: false as const, error: "Token inválido." };

		try {
			await performPasswordReset(fields.newPassword, fields.token, context.request.headers);
			trackServerEvent({
				distinctId: "anonymous",
				event: "password_reset_completed",
			});

			await flushServerEvents();

			return { success: true as const };
		} catch {
			return { success: false as const, error: "Erro ao redefinir senha." };
		}
	},
});
