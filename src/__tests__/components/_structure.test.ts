import { readdirSync, readFileSync } from "fs";
import { join } from "path";
import { describe, it, expect } from "vitest";

describe("components contains only component rendering tests", () => {
	it("every .test.ts file in components/ imports @testing-library/svelte", () => {
		const dir = join(process.cwd(), "src/__tests__/components");
		const files = readdirSync(dir).filter((f) => f.endsWith(".test.ts"));
		for (const file of files) {
			const content = readFileSync(join(dir, file), "utf-8");
			expect(content).toContain("@testing-library/svelte");
		}
	});
});
