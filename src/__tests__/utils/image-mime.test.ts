import { describe, it, expect } from "vitest";
import { detectImageMime } from "../../utils/imageMime";

const sig = (bytes: number[]) => new Uint8Array(bytes);

describe("detectImageMime", () => {
	it("detects PNG by its magic bytes", () => {
		expect(detectImageMime(sig([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))).toBe(
			"image/png",
		);
	});

	it("detects JPEG, GIF, BMP and WebP", () => {
		expect(detectImageMime(sig([0xff, 0xd8, 0xff, 0xe0]))).toBe("image/jpeg");
		expect(detectImageMime(sig([0x47, 0x49, 0x46, 0x38, 0x37, 0x61]))).toBe("image/gif");
		expect(detectImageMime(sig([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]))).toBe("image/gif");
		expect(detectImageMime(sig([0x42, 0x4d]))).toBe("image/bmp");
		expect(detectImageMime(sig([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50]))).toBe(
			"image/webp",
		);
	});

	it("falls back to application/octet-stream for unknown bytes", () => {
		expect(detectImageMime(sig([0x00, 0x01, 0x02]))).toBe("application/octet-stream");
		expect(detectImageMime(new Uint8Array([]))).toBe("application/octet-stream");
	});

	it("does not treat short buffers as matches", () => {
		expect(detectImageMime(sig([0x89, 0x50]))).toBe("application/octet-stream");
	});
});
