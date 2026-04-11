import * as Sentry from "@sentry/astro";

interface LogPayload {
	message: string;
	context?: string;
	metadata?: Record<string, unknown>;
	error?: unknown;
}

export const logger = {
	info: (payload: LogPayload) => {
		console.log(`[INFO] ${payload.message}`);
		Sentry.addBreadcrumb({
			category: payload.context || "general",
			message: payload.message,
			level: "info",
			data: payload.metadata,
		});
	},

	warn: (payload: LogPayload) => {
		console.warn(`[WARN] ${payload.message}`);
		Sentry.addBreadcrumb({
			category: payload.context || "general",
			message: payload.message,
			level: "warning",
			data: payload.metadata,
		});
	},

	error: (payload: LogPayload) => {
		console.error(`[ERROR] ${payload.message}`, payload.error);

		Sentry.withScope((scope) => {
			if (payload.context) scope.setTag("context", payload.context);
			if (payload.metadata) scope.setContext("metadata", payload.metadata);

			const errorToSend =
				payload.error instanceof Error ? payload.error : new Error(payload.message);

			Sentry.captureException(errorToSend);
		});
	},
};
