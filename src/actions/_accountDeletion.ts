import { defineAction } from "astro:actions";
import { z } from "astro/zod";
import { parseSchema } from "@utils/validation";
import { withAuth } from "@utils/action-guard";
import { auth } from "@auth";

import { deleteOwnAccount } from "@services/auth/deletion";
import { AccountDeletionErrors } from "@customTypes/errors";
import { trackServerEvent, flushServerEvents } from "@observability/tracking-server";

const DeleteAccountSchema = z.object({
	password: z.string().min(1),
});

export const deleteAccount = defineAction({
	accept: "form",
	handler: withAuth(async (input: FormData, context, session) => {
		const { fields, success: schemaSuccess } = parseSchema(input, DeleteAccountSchema);
		if (!schemaSuccess) {
			return { success: false as const, error: "Senha obrigatória." };
		}

		try {
			await deleteOwnAccount(session.id, fields.password);

			// Cascade dropped the session row but the browser/app still holds the
			// cookie — clear it so the next request is unambiguously logged out.
			await auth.api.signOut({
				headers: context.request.headers,
			});

			trackServerEvent({
				distinctId: session.username ?? session.id,
				event: "account_deleted",
			});
			await flushServerEvents();

			return { success: true as const };
		} catch (error) {
			if (error instanceof Error) {
				switch (error.message) {
					case AccountDeletionErrors.WRONG_PASSWORD:
						return { success: false as const, error: "Senha incorreta." };
					case AccountDeletionErrors.DELETION_FAILED:
						return { success: false as const, error: "Não foi possível excluir a conta." };
				}
			}
			return { success: false as const, error: "Erro interno ao excluir a conta." };
		}
	}),
});
