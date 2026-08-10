import { describe, it, expect } from "vitest";

import { checkAuthRateLimit } from "../../utils/auth-rate-limit";

describe("checkAuthRateLimit", () => {
	it("allows a few attempts then blocks the same identity from the same ip", () => {
		const ip = "203.0.113.7";
		const identity = "victim@example.com";

		for (let i = 0; i < 5; i++) {
			expect(() => checkAuthRateLimit(ip, identity)).not.toThrow();
		}
		expect(() => checkAuthRateLimit(ip, identity)).toThrow(/Muitas tentativas/);
	});

	it("an identity's account-level bucket cannot be bypassed by rotating IPs", () => {
		const identity = "shared@example.com";

		for (let i = 0; i < 5; i++) checkAuthRateLimit("198.51.100.1", identity);
		expect(() => checkAuthRateLimit("198.51.100.1", identity)).toThrow(/Muitas tentativas/);

		// The per-identity bucket is global, so a different IP is blocked too.
		expect(() => checkAuthRateLimit("203.0.113.9", identity)).toThrow(/Muitas tentativas/);
	});

	it("blocks a single ip that sprays many identities", () => {
		const ip = "192.0.2.55";

		for (let i = 0; i < 20; i++) {
			expect(() => checkAuthRateLimit(ip, `user-${i}@example.com`)).not.toThrow();
		}
		expect(() => checkAuthRateLimit(ip, "attacker@example.com")).toThrow(/Muitas tentativas/);
	});

	it("still applies the per-identity bucket when no ip is available", () => {
		const identity = "noip@example.com";

		for (let i = 0; i < 5; i++) {
			expect(() => checkAuthRateLimit(undefined, identity)).not.toThrow();
		}
		expect(() => checkAuthRateLimit(undefined, identity)).toThrow(/Muitas tentativas/);
	});

	it("keeps the attempt map bounded by evicting the oldest entry under a flood", () => {
		// Depends on the internal MAX_ENTRIES (10_000) budget in auth-rate-limit.ts:
		// flooding with more distinct ip+identity pairs than fit must evict the
		// oldest buckets instead of growing the map without bound.
		const victimIp = "203.0.113.200";
		const victimIdentity = "flood-victim@example.com";

		for (let i = 0; i < 5; i++) checkAuthRateLimit(victimIp, victimIdentity);
		expect(() => checkAuthRateLimit(victimIp, victimIdentity)).toThrow(/Muitas tentativas/);

		for (let i = 0; i < 10_001; i++) {
			checkAuthRateLimit(`ip-${i}`, `flood-${i}@example.com`);
		}

		// The victim's buckets were the oldest and got evicted, so the cap resets.
		expect(() => checkAuthRateLimit(victimIp, victimIdentity)).not.toThrow();
	});
});
