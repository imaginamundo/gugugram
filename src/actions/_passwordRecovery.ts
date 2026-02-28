import { defineAction } from "astro:actions";
import { z } from "astro:schema";
import { auth } from "@auth/auth";

export const requestPasswordReset = defineAction({
	accept: "form",
	input: z.object({
		email: z.string().email("E-mail inválido"),
	}),
	handler: async (input, context) => {
		await auth.api.requestPasswordReset({
			headers: context.request.headers,
			body: {
				email: input.email,
				redirectTo: "http://localhost:4321/nova-senha",
			},
		});

		return { success: true, message: "Se o e-mail existir, um link foi enviado." };
	},
});

export const resetPassword = defineAction({
	accept: "form",
	input: z.object({
		newPassword: z.string().min(8, "A senha deve ter 8 caracteres"),
		token: z.string(),
	}),
	handler: async (input, context) => {
		try {
			await auth.api.resetPassword({
				headers: context.request.headers,
				body: {
					newPassword: input.newPassword,
					token: input.token,
				},
			});

			return { success: true };
		} catch (error) {
			throw new Error("Token inválido ou expirado.");
		}
	},
});
