import { auth } from "@features/authentication/utils/auth"; // Adjust path to your auth.ts
import type { APIRoute } from "astro";

export const ALL: APIRoute = async (ctx) => {
	return auth.handler(ctx.request);
};