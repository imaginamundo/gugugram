export function checkRateLimit(
	lastCreatedAt: Date | null | undefined,
	limitMs: number,
	message: string,
): void {
	if (!lastCreatedAt) return;
	const timeDiff = Date.now() - lastCreatedAt.getTime();
	if (timeDiff < limitMs) {
		const timeLeft = Math.ceil((limitMs - timeDiff) / 1000);
		throw new Error(`${message} ${timeLeft} segundo(s).`);
	}
}
