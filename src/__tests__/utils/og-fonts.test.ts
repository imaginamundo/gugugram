import { describe, it, expect } from "vitest";
import { msSansSerifBase64 } from "../../utils/og-fonts";

describe("og-fonts", () => {
	it("embeds a valid TTF file (TrueType magic bytes)", () => {
		const data = Buffer.from(msSansSerifBase64, "base64");
		expect(data.subarray(0, 4)).toEqual(Buffer.from([0x00, 0x01, 0x00, 0x00]));
	});

	it("embeds a non-empty, reasonably sized font", () => {
		expect(Buffer.from(msSansSerifBase64, "base64").length).toBeGreaterThan(1_000);
	});
});
