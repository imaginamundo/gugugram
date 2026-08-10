import { describe, it, expect } from "vitest";
import {
	ALLOWED_IMAGE_HOSTS,
	buildOgCardSvg,
	escapeXml,
	OG_CARD_WIDTH,
	OG_CARD_HEIGHT,
} from "../../utils/og-card";

describe("escapeXml", () => {
	it("escapes XML special characters", () => {
		expect(escapeXml(`a&b<c>"d`)).toBe("a&amp;b&lt;c&gt;&quot;d");
	});
});

describe("buildOgCardSvg", () => {
	it("includes the username and the image href", () => {
		const svg = buildOgCardSvg("https://cdn.ufs.sh/f/img.webp", "dio");

		expect(svg).toContain(">dio</text>");
		expect(svg).toContain("Gugugram - Imagem de dio");
		expect(svg).toContain('href="https://cdn.ufs.sh/f/img.webp"');
		expect(svg).toContain(`width="${OG_CARD_WIDTH}" height="${OG_CARD_HEIGHT}"`);
	});

	it("renders the image as a 1:1 square with hard-edge pixel scaling", () => {
		const svg = buildOgCardSvg("https://cdn.ufs.sh/f/img.webp", "dio");

		expect(svg).toContain('width="478" height="478"');
		expect(svg).toContain('preserveAspectRatio="xMidYMid slice"');
		expect(svg).toContain('image-rendering="optimizeSpeed"');
	});

	it("uses the site's title bar gradient", () => {
		const svg = buildOgCardSvg("https://cdn.ufs.sh/f/img.webp", "dio");

		expect(svg).toContain("#000080");
		expect(svg).toContain("#1084d0");
	});

	it("has no status bar", () => {
		const svg = buildOgCardSvg("https://cdn.ufs.sh/f/img.webp", "dio");

		expect(svg).not.toContain("Isso é um site.");
	});

	it("bottom-aligns the call-to-action box with the image", () => {
		const svg = buildOgCardSvg("https://cdn.ufs.sh/f/img.webp", "dio");

		// Image frame bottom edge is at y=588; the box spans to y=588 too.
		expect(svg).toContain('<rect x="52" y="588" width="480" height="1" fill="#ffffff"/>');
		expect(svg).toContain('<rect x="552" y="588" width="664" height="1" fill="#ffffff"/>');
		// CTA text sits near the bottom of its box, not centered.
		expect(svg).toContain(
			'<text x="580" y="550" font-size="22" fill="#222222">Veja a foto e os comentários na página!</text>',
		);
	});

	it("escapes user content in the SVG", () => {
		const svg = buildOgCardSvg("https://cdn.ufs.sh/f/a&b.png", "x<&>y");

		expect(svg).toContain(">x&lt;&amp;&gt;y</text>");
		expect(svg).toContain("a&amp;b.png");
		expect(svg).not.toContain("a&b.png");
	});
});

describe("ALLOWED_IMAGE_HOSTS", () => {
	it("allows uploadthing CDN hosts only", () => {
		expect(ALLOWED_IMAGE_HOSTS.test("k88xn72xv0.ufs.sh")).toBe(true);
		expect(ALLOWED_IMAGE_HOSTS.test("utfs.io")).toBe(true);
		expect(ALLOWED_IMAGE_HOSTS.test("a.b.utfs.io")).toBe(true);

		expect(ALLOWED_IMAGE_HOSTS.test("evil.com")).toBe(false);
		expect(ALLOWED_IMAGE_HOSTS.test("ufs.sh.evil.com")).toBe(false);
	});
});
