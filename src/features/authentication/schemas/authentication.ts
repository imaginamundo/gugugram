import { z } from "astro/zod";

const OBLIGATORY_FIELD = "Campo obrigatório.";
const INVALID_FIELD = (field: string, feminine?: boolean) =>
	`${field} inválid${feminine ? "a" : "o"}`;
const FIELD_SIZE_LIMIT = (max: number) => `Quantidade máxima de ${max} caracteres.`;
const UNAVAILABLE_USERNAME = "Nome de usuário indisponível.";

const RESERVED_USERNAMES = new Set([
	"entrar",
	"cadastrar",
	"esqueci-minha-senha",
	"nova-senha",
	"editar-perfil",
	"sobre",
	"api",
	"gugugram",
	"components",
	"admin",
	"manager",
]);

const usernameSchema = z
	.string()
	.min(1, OBLIGATORY_FIELD)
	.max(14, FIELD_SIZE_LIMIT(14))
	.regex(/^[a-zA-Z0-9_]+$/, INVALID_FIELD("Usuário"))
	.refine((val) => !RESERVED_USERNAMES.has(val.toLowerCase()), {
		error: UNAVAILABLE_USERNAME,
	});

const emailSchema = z
	.email(INVALID_FIELD("E-mail"))
	.min(1, OBLIGATORY_FIELD)
	.max(40, FIELD_SIZE_LIMIT(40));

const usernameOrEmailSchema = z.union([usernameSchema, emailSchema]);

const passwordSchema = z.string().min(1, OBLIGATORY_FIELD).max(40, FIELD_SIZE_LIMIT(14));

export const LoginSchema = z.object({
	identity: usernameOrEmailSchema,
	password: passwordSchema,
});

export const RegisterSchema = z.object({
	username: usernameSchema,
	email: emailSchema,
	password: passwordSchema,
});
