export function defineMiddleware(handler: (...args: unknown[]) => unknown) {
	return handler;
}
export function sequence(...handlers: ((...args: unknown[]) => unknown)[]) {
	return handlers;
}
