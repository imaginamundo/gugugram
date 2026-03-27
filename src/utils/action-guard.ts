import type { ActionAPIContext } from "astro:actions";

type AuthedHandler<TInput, TOutput> = (
	input: TInput,
	context: ActionAPIContext,
	session: NonNullable<App.Locals["user"]>,
) => Promise<TOutput>;

export function withAuth<TInput, TOutput>(
	handler: AuthedHandler<TInput, TOutput>,
): (
	input: TInput,
	context: ActionAPIContext,
) => Promise<TOutput | { success: false; error: string }> {
	return async (input, context) => {
		const session = context.locals.user;
		if (!session) return { success: false as const, error: "Não autenticado." };
		return handler(input, context, session);
	};
}
