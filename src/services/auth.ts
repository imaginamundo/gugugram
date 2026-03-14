import { auth } from "@lib/auth";
import { APIError } from "better-auth/api";

const authTranslations = {
	USER_NOT_FOUND: "Usuário não encontrado.",
	INVALID_EMAIL_OR_PASSWORD: "E-mail ou senha inválidos.",
	INVALID_PASSWORD: "Senha inválida.",
	EMAIL_NOT_VERIFIED: "E-mail não verificado.",
	SESSION_EXPIRED: "Sessão expirada.",
	ACCESS_DENIED: "Acesso negado.",
	ACCOUNT_NOT_FOUND: "Conta não encontrada.",
	AUTHENTICATION_REQUIRED: "Autenticação necessária necessária.",
	INVALID_EMAIL: "E-mail inválido.",
	INVALID_USERNAME_OR_PASSWORD: "Usuário ou senha inválidos.",
	USERNAME_IS_ALREADY_TAKEN: "Nome de usuário já está em uso.",
	USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: "E-mail já cadastrado.",
	EMAIL_IS_ALREADY_TAKEN: "E-mail já está em uso.",
	USERNAME_TOO_LONG: "Nome de usuário muito longo.",
	USERNAME_TOO_SHORT: "Nome de usuário muito curto.",
	UNKNOWN_ERROR: "Erro desconhecido. :(",
	TOKEN_EXPIRED: "Token expirado.",
	INVALID_TOKEN: "Token inválido.",
	PASSWORD_TOO_SHORT: "Senha muito curta.",
	PASSWORD_TOO_LONG: "Senha muito longa.",
} as const;

export async function authenticateUser(identity: string, password: string) {
	const isEmail = identity.includes("@") && identity.includes(".");

	try {
		const response = isEmail
			? await auth.api.signInEmail({
					body: { email: identity, password },
					asResponse: true,
				})
			: await auth.api.signInUsername({
					body: { username: identity, password },
					asResponse: true,
				});

		if (!response.ok) {
			const errorData = await response.json();
			const code = errorData.code as keyof typeof authTranslations;
			throw new Error(authTranslations[code] || "Erro desconhecido. :(");
		}

		const data = await response.json();
		return { data, headers: response.headers };
	} catch (error) {
		if (error instanceof APIError) {
			const code = error.body?.code as keyof typeof authTranslations;
			throw new Error(authTranslations[code] || "Erro desconhecido. :(");
		}
		throw error;
	}
}

export async function registerNewUser(email: string, username: string, password: string) {
	try {
		const response = await auth.api.signUpEmail({
			body: { email, name: "", username, password },
			asResponse: true,
		});

		if (!response.ok) {
			const errorData = await response.json();
			const code = errorData.code as keyof typeof authTranslations;
			console.log({ code });
			throw new Error(authTranslations[code] || "Erro desconhecido. :(");
		}

		const data = await response.json();
		return { data, headers: response.headers };
	} catch (error) {
		if (error instanceof APIError) {
			const code = error.body?.code as keyof typeof authTranslations;
			console.log({ code });
			throw new Error(authTranslations[code] || "Erro desconhecido. :(");
		}
		throw error;
	}
}

export async function sendPasswordResetEmail(
	email: string,
	redirectTo: string,
	requestHeaders: Headers,
) {
	const response = await auth.api.requestPasswordReset({
		headers: requestHeaders,
		body: { email, redirectTo },
		asResponse: true,
	});

	if (!response.ok) throw new Error("RESET_REQUEST_FAILED");
}

export async function performPasswordReset(
	newPassword: string,
	token: string,
	requestHeaders: Headers,
) {
	const response = await auth.api.resetPassword({
		headers: requestHeaders,
		body: { newPassword, token },
		asResponse: true,
	});

	if (!response.ok) throw new Error("RESET_FAILED");
}
