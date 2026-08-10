import { describe, it, expect, vi } from "vitest";
import { checkOrigin } from "../../middleware/_checkOrigin";

type Ctx = { request: Request };

async function run(init: RequestInit, url = "http://localhost:4321/api/logout") {
	const context: Ctx = { request: new Request(url, init) };
	const next = vi.fn().mockResolvedValue(new Response("ok", { status: 200 }));
	const result = await checkOrigin(context as never, next as never);
	return { result, next };
}

describe("checkOrigin", () => {
	it("allows the canonical production origins", async () => {
		for (const origin of ["https://www.gugugram.com", "https://gugugram.com"]) {
			const { next } = await run({ method: "POST", headers: { Origin: origin } });
			expect(next).toHaveBeenCalled();
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
