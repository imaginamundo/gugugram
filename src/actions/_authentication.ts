import { defineAction } from "astro:actions";
import { authenticateUser, registerNewUser } from "@services/auth";
import { parseSchema } from "@utils/validation";
import { LoginSchema, RegisterSchema } from "@schemas/authentication";
import { applySetCookie } from "@utils/cookie";
import {
	trackServerEvent,
	identifyUserServer,
	flushServerEvents,
} from "@observability/tracking-server";

export const login = defineAction({
	accept: "form",
	handler: async (input, context) => {
		const { fields, fieldErrors, success: schemaSuccess } = parseSchema(input, LoginSchema);

		if (!schemaSuccess) {
			return {
				success: false as const,
				error: "Erro na validação dos campos",
				fields,
				fieldErrors,
			};
		}

		try {
			const { data, headers } = await authenticateUser(fields.identity, fields.password);

			applySetCookie(headers, context.cookies);

			const username = data.user.username as string;
			const sessionId = context.request.headers.get("X-PostHog-Session-Id");

			identifyUserServer({
				distinctId: username,
				properties: { username, email: data.user.email },
			});

			trackServerEvent({
				distinctId: username,
				event: "user_login",
				properties: { $session_id: sessionId || undefined },
			});

			await flushServerEvents();

			return {
				success: true as const,
				username,
			};
		} catch (error) {
			if (error instanceof Error) {
				return {
					success: false as const,
					fields,
					fieldErrors: {},
					error: error.message,
				};
			}

			return {
				success: false as const,
				error: "Erro interno.",
				fields,
				fieldErrors: {},
			};
		}
	},
});

export const register = defineAction({
	accept: "form",
	handler: async (input, context) => {
		const { fields, fieldErrors, success: schemaSuccess } = parseSchema(input, RegisterSchema);

		if (!schemaSuccess) {
			return { success: false as const, fields, fieldErrors, error: "Dados inválidos" };
		}

		try {
			const { headers } = await registerNewUser(fields.email, fields.username, fields.password);

			applySetCookie(headers, context.cookies);

			const sessionId = context.request.headers.get("X-PostHog-Session-Id");

			identifyUserServer({
				distinctId: fields.username,
				properties: { username: fields.username, email: fields.email },
			});

			trackServerEvent({
				distinctId: fields.username,
				event: "user_login",
				properties: { $session_id: sessionId || undefined },
			});

			return {
				success: true as const,
				username: fields.username,
			};
		} catch (error) {
			if (error instanceof Error) {
				return {
					success: false as const,
					fields,
					fieldErrors: {},
					error: error.message,
				};
			}

			return {
				success: false as const,
				fields,
				fieldErrors: {},
				error: "Erro interno.",
			};
		}
	},
});
