import { describe, it, expect } from "vitest";
import { securityHeaders } from "../../middleware/_securityHeaders";

function runMiddleware(nextResponse: Response) {
	return securityHeaders({} as never, async () => nextResponse) as Promise<Response>;
}

describe("securityHeaders middleware", () => {
	it("adds hardening headers to responses", async () => {
		const res = await runMiddleware(new Response("ok"));

		expect(res.headers.get("X-Frame-Options")).toBe("SAMEORIGIN");
		expect(res.headers.get("X-Content-Type-Options")).toBe("nosniff");
		expect(res.headers.get("Referrer-Policy")).toBe("same-origin");
		expect(res.headers.get("Strict-Transport-Security")).toBe("max-age=31536000");
		expect(res.headers.get("Permissions-Policy")).toContain("geolocation=()");

		const csp = res.headers.get("Content-Security-Policy") ?? "";
		expect(csp).toContain("default-src 'self'");
		expect(csp).toContain("frame-ancestors 'none'");
		expect(csp).toContain("object-src 'none'");
		expect(csp).toContain("form-action 'self'");
		expect(csp).toContain("img-src 'self' data: blob: https://utfs.io https://*.utfs.io https://*.ufs.sh");
	});

	it("preserves status and body of the wrapped response", async () => {
		const res = await runMiddleware(new Response("nope", { status: 403 }));

		expect(res.status).toBe(403);
		expect(await res.text()).toBe("nope");
	});

	it("keeps pre-existing headers set by inner middleware", async () => {
		const inner = new Response("ok", {
			headers: { "Cache-Control": "public, max-age=3600" },
		});
		const res = await runMiddleware(inner);

		expect(res.headers.get("Cache-Control")).toBe("public, max-age=3600");
	});
});
