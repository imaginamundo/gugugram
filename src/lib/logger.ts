type LogLevel = "info" | "warn" | "error" | "debug";

interface LogPayload {
	message: string;
	context?: string;
	metadata?: Record<string, unknown>;
	error?: unknown;
}

function formatLog(level: LogLevel, payload: LogPayload) {
	return JSON.stringify({
		timestamp: new Date().toISOString(),
		level,
		...payload,
	});
}

export const logger = {
	info: (payload: LogPayload) => console.log(formatLog("info", payload)),
	warn: (payload: LogPayload) => console.warn(formatLog("warn", payload)),
	error: (payload: LogPayload) => console.error(formatLog("error", payload)),
	debug: (payload: LogPayload) => {
		if (import.meta.env.DEV) {
			console.debug(formatLog("debug", payload));
		}
	},
};
