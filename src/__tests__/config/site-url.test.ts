import { readFileSync } from "fs";
import { join } from "path";
import { describe, it, expect } from "vitest";

// `site` feeds canonical URLs, OG tags, the sitemap `<loc>` entries,
// `auth.baseURL` and the password-reset link that gets emailed to users.
// Production 308-redirects http -> https, so an `http://` value here
// advertises a scheme the site never actually serves.
const config = readFileSync(join(process.cwd(), "astro.config.js"), "utf-8");

describe("astro.config.js", () => {
	it("declares `site` over https", () => {
		const match = config.match(/^\s*site:\s*"([^"]+)"/m);
		expect(match?.[1]).toBeDefined();
		expect(new URL(match![1]).protocol).toBe("https:");
	});
});
