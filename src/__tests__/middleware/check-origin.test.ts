import { describe, it, expect, vi } from "vitest";
import { checkOrigin } from "../../middleware/_checkOrigin";

type Ctx = { request: Request };

async function run(init: RequestInit, url = "http://localhost:4321/api/auth/sign-out") {
	const context: Ctx = { request: new Request(url, init) };
	const next = vi.fn().mockResolvedValue(new Response("ok", { status: 200 }));
	const result = await checkOrigin(context as never, next as never);
	return { result, next };
}

describe("checkOrigin", () => {
	it("allows POST requests without an Origin header (some browsers omit it on same-origin form POSTs)", async () => {
		const { next } = await run({ method: "POST" });
		expect(next).toHaveBeenCalled();
	});

	it("allows the dev origin http://localhost:4321 and rejects other localhost ports/hostnames", async () => {
		const { next } = await run({ method: "POST", headers: { Origin: "http://localhost:4321" } });
		expect(next).toHaveBeenCalled();

		for (const origin of [
			"http://localhost:9999",
			"http://127.0.0.1:4321",
			"http://127.0.0.1:3000",
		]) {
			const { result, next: nextForOrigin } = await run({
				method: "POST",
				headers: { Origin: origin },
			});
			expect(nextForOrigin).not.toHaveBeenCalled();
			expect((result as Response).status).toBe(403);
		}
	});

	it("allows the canonical production origins", async () => {
		for (const origin of ["https://www.gugugram.com", "https://gugugram.com"]) {
			const { next } = await run({ method: "POST", headers: { Origin: origin } });
			expect(next).toHaveBeenCalled();
		}
	});

	it("rejects an opaque/null Origin (opaque origins are untrusted)", async () => {
		const cases: Record<string, HeadersInit | undefined> = {
			"no referer": undefined,
			"same-site referer": { Referer: "http://localhost:4321/entrar" },
		};
		for (const [label, headers] of Object.entries(cases)) {
			const { result, next } = await run({
				method: "POST",
				headers: { Origin: "null", ...headers },
			});
			expect(next).not.toHaveBeenCalled();
			expect((result as Response).status).toBe(403);
			expect(label).toBeTruthy();
		}
	});

	it("rejects cross-site origins with a 403 and does not continue", async () => {
		for (const origin of ["https://evil.com", "https://www.gugugram.com.evil.com"]) {
			const { result, next } = await run({ method: "POST", headers: { Origin: origin } });
			expect(next).not.toHaveBeenCalled();
			expect(result).toBeInstanceOf(Response);
			const response = result as Response;
			expect(response.status).toBe(403);
			expect(await response.text()).toBe("Cross-site POST form submissions are forbidden.");
		}
	});

	it("rejects https:// localhost origins (only the http dev server is trusted)", async () => {
		const { result, next } = await run({
			method: "POST",
			headers: { Origin: "https://localhost:4321" },
		});
		expect(next).not.toHaveBeenCalled();
		expect((result as Response).status).toBe(403);
	});

	it("does not check GET requests", async () => {
		const { next } = await run({ method: "GET", headers: { Origin: "https://evil.com" } });
		expect(next).toHaveBeenCalled();
	});
});
