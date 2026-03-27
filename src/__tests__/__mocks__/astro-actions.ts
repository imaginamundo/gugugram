export function defineAction(config: {
	handler: (...args: unknown[]) => unknown;
	accept?: string;
}) {
	return config;
}
