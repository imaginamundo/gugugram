/**
 * Minimum-interval cooldown for content creation (image posts, comments,
 * messages, community posts/responses). State lives in the database
 * (`lastCreatedAt` on the author's latest row), so it survives restarts and
 * is shared across all serverless instances — unlike the in-memory auth
 * limiter in `auth-rate-limit.ts`.
 */
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
