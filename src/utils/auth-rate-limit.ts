const AUTH_WINDOW_MS = 60_000;
const AUTH_MAX_PER_KEY = 5;
const AUTH_MAX_PER_IP = 20;
const MAX_ENTRIES = 10_000;
const PRUNE_INTERVAL_MS = 1_000;

const authAttempts = new Map<string, { count: number; resetAt: number }>();
let lastPruneAt = 0;

function pruneExpired(now: number): void {
	if (now - lastPruneAt < PRUNE_INTERVAL_MS) return;
	lastPruneAt = now;
	for (const [key, entry] of authAttempts) {
		if (entry.resetAt <= now) authAttempts.delete(key);
	}
}

function evictOldest(): void {
	let oldestKey: string | undefined;
	let oldestResetAt = Number.POSITIVE_INFINITY;
	for (const [key, entry] of authAttempts) {
		if (entry.resetAt < oldestResetAt) {
			oldestResetAt = entry.resetAt;
			oldestKey = key;
		}
	}
	if (oldestKey !== undefined) authAttempts.delete(oldestKey);
}

function consumeAuthAttempt(key: string, now: number): number {
	const entry = authAttempts.get(key);

	if (!entry || entry.resetAt <= now) {
		if (authAttempts.size >= MAX_ENTRIES) {
			pruneExpired(now);
			if (authAttempts.size >= MAX_ENTRIES) evictOldest();
		}
		authAttempts.set(key, { count: 1, resetAt: now + AUTH_WINDOW_MS });
		return 1;
	}

	entry.count += 1;
	return entry.count;
}

export function checkAuthRateLimit(ip: string | undefined, identity: string): void {
	const now = Date.now();

	pruneExpired(now);

	if (ip) {
		const perIpCount = consumeAuthAttempt(`ip:${ip}`, now);
		if (perIpCount > AUTH_MAX_PER_IP) {
			throw new Error("Muitas tentativas. Aguarde 1 minuto e tente novamente.");
		}
	}

	const perIdentityCount = consumeAuthAttempt(`identity:${identity}`, now);
	if (perIdentityCount > AUTH_MAX_PER_KEY) {
		throw new Error("Muitas tentativas. Aguarde 1 minuto e tente novamente.");
	}
}
