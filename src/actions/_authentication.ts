import { defineAction } from "astro:actions";
import { auth } from "@auth/auth";
import { authErrors, type AuthErrorCode } from "@auth/client";
import { parseSchema } from "@utils/validation";
import { LoginSchema, RegisterSchema } from "@features/authentication/schemas/authentication";
import { applySetCookie } from "@auth/cookie";

export const login = defineAction({
	accept: "form",
	handler: async (input, context) => {
		const {
			fields,
			fieldErrors,
			success: schemaSuccess,
		} = parseSchema<typeof LoginSchema>(input, LoginSchema);

		if (!schemaSuccess) {
			return {
				success: false as const,
				error: "Erro na validação dos campos",
				fields,
				fieldErrors,
			};
		}

		const isEmail = fields.identity.includes("@") && fields.identity.includes(".");

		try {
			const response = isEmail
				? await auth.api.signInEmail({
						body: { email: fields.identity, password: fields.password },
						asResponse: true,
					})
				: await auth.api.signInUsername({
						body: { username: fields.identity, password: fields.password },
						asResponse: true,
					});

			if (!response.ok) {
				const errorData = await response.json();
				const errorCode = errorData.code as AuthErrorCode;

				return {
					success: false as const,
					error: authErrors[errorCode] || authErrors["INVALID_USERNAME_OR_PASSWORD"],
					fields,
					fieldErrors: {},
				};
			}

			applySetCookie(response.headers, context.cookies);

			const data = await response.json();

			return {
				success: true as const,
				username: data.user.username as string,
			};
		} catch (e) {
			console.error(e);
			return {
				success: false as const,
				error: authErrors["INTERNAL_SERVER_ERROR"],
				fields,
				fieldErrors: {},
			};
		}
	},
});

export const register = defineAction({
	accept: "form",
	handler: async (input, context) => {
		const { fields, success: schemaSuccess } = parseSchema(input, RegisterSchema);

		if (!schemaSuccess) {
			return { success: false as const, error: "Dados inválidos" };
		}

		try {
			const response = await auth.api.signUpEmail({
				body: {
					email: fields.email,
					name: "",
					username: fields.username,
					password: fields.password,
				},
				asResponse: true,
			});

			if (response.ok) {
				applySetCookie(response.headers, context.cookies);
				const data = await response.json();
				return {
					success: true as const,
					username: fields.username,
				};
			}

			const errorData = await response.json();
			const errorCode = errorData.code as AuthErrorCode;

			return {
				success: false as const,
				error: authErrors[errorCode] || "Erro ao criar conta",
			};
		} catch (e) {
			return {
				success: false as const,
				error: authErrors["INTERNAL_SERVER_ERROR"],
			};
		}
	},
});
