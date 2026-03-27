import { readdirSync, readFileSync } from "fs";
import { join } from "path";
import { describe, it, expect } from "vitest";

describe("utils/ test directory", () => {
	it("every .test.ts file imports from ../../utils/", () => {
		const dir = join(process.cwd(), "src/__tests__/utils");
		const files = readdirSync(dir).filter(
			(f) => f.endsWith(".test.ts") && f !== "structure.test.ts",
		);
		for (const file of files) {
			const content = readFileSync(join(dir, file), "utf-8");
			expect(content).toContain("../../utils/");
		}
	});
});

describe("stores/ test directory", () => {
	it("every .test.ts file imports from ../../stores/", () => {
		const dir = join(process.cwd(), "src/__tests__/stores");
		const files = readdirSync(dir).filter((f) => f.endsWith(".test.ts"));
		for (const file of files) {
			const content = readFileSync(join(dir, file), "utf-8");
			expect(content).toContain("../../stores/");
		}
	});
});
