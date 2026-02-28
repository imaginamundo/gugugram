import { createAuthClient } from "better-auth/svelte";

export const authClient = createAuthClient({
	baseURL: import.meta.env.PUBLIC_BASE_URL,
});

export const authErrors = {
	// Erros de Autenticação Geral
	USER_NOT_FOUND: "Usuário não encontrado.",
	INVALID_USERNAME_OR_PASSWORD: "Usuário ou senha inválidos.",
	INVALID_PASSWORD: "A senha informada está inválida.",
	INVALID_EMAIL: "O formato do e-mail é inválido.",
	USER_ALREADY_EXISTS: "Já existe um usuário com este e-mail.",
	SESSION_EXPIRED: "Sua sessão expirou. Por favor, faça login novamente.",
	UNAUTHORIZED: "Você não tem permissão para realizar esta ação.",

	// Erros de Cadastro / Senha
	PASSWORD_TOO_SHORT: "A senha é muito curta. Use pelo menos 8 caracteres.",
	PASSWORD_TOO_LONG: "A senha é muito longa. O limite é de 32 caracteres.",
	FAILED_TO_CREATE_USER: "Não foi possível criar sua conta. Tente novamente mais tarde.",

	// Erros de Redefinição e Verificação
	INVALID_TOKEN: "O código de verificação é inválido ou expirou.",
	EXPIRED_TOKEN: "Este link já expirou.",
	EMAIL_NOT_VERIFIED: "Você precisa verificar seu e-mail antes de acessar.",

	// Erros de Rate Limit (Segurança)
	TOO_MANY_REQUESTS: "Muitas tentativas seguidas. Aguarde um pouco e tente de novo.",
	INTERNAL_SERVER_ERROR: "Ocorreu um erro interno no servidor.",
} as const;
export type AuthErrorCode = keyof typeof authErrors;
