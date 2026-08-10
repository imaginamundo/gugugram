import type { APIRoute } from "astro";
import { mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { renderAsync } from "@resvg/resvg-js";
import { getPostForOg } from "@services/imagePost";
import { ALLOWED_IMAGE_HOSTS, buildOgCardSvg, OG_CARD_WIDTH } from "@utils/og-card";
import { detectImageMime } from "@utils/imageMime";
import { msSansSerifBase64 } from "@utils/og-fonts";

let fontFilePathPromise: Promise<string | null> | null = null;

function loadFontFilePath(): Promise<string | null> {
	fontFilePathPromise ??= (async () => {
		try {
			const dir = join(tmpdir(), "gugugram-og-fonts");
			await mkdir(dir, { recursive: true });
			const file = join(dir, "ms-sans-serif.ttf");
			await writeFile(file, Buffer.from(msSansSerifBase64, "base64"));
			return file;
		} catch {
			return null;
		}
	})();
	return fontFilePathPromise;
}

const FALLBACK_IMAGE =
	"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

const IMAGE_FETCH_TIMEOUT_MS = 5_000;

const OG_HEADERS: Record<string, string> = {
	"Content-Type": "image/png",
	"Cache-Control":
		"public, s-maxage=31536000, stale-while-revalidate=31536000, max-age=31536000, immutable",
};

function pngResponse(png: Buffer): Response {
	return new Response(new Uint8Array(png), { headers: OG_HEADERS });
}

async function fetchPostImageAsDataUri(url: string): Promise<string | null> {
	try {
		const parsed = new URL(url);
		if (!ALLOWED_IMAGE_HOSTS.test(parsed.host)) return null;

		const response = await fetch(url, { signal: AbortSignal.timeout(IMAGE_FETCH_TIMEOUT_MS) });
		if (!response.ok) return null;

		const data = Buffer.from(await response.arrayBuffer());
		return `data:${detectImageMime(data)};base64,${data.toString("base64")}`;
	} catch {
		return null;
	}
}

export const GET: APIRoute = async ({ params, request }) => {
	const { postId } = params;
	if (!postId) return new Response("Not found", { status: 404 });

	const post = await getPostForOg(postId);
	if (!post) return new Response("Not found", { status: 404 });

	const requestUrl = new URL(request.url);
	const imageUrl = post.image.startsWith("http")
		? post.image
		: new URL(post.image, requestUrl.origin).toString();

	const dataUri = (await fetchPostImageAsDataUri(imageUrl)) ?? FALLBACK_IMAGE;
	const svg = buildOgCardSvg(dataUri, post.username);

	const fontFilePath = await loadFontFilePath();
	const rendered = await renderAsync(svg, {
		font: fontFilePath
			? {
					loadSystemFonts: false,
					fontFiles: [fontFilePath],
					defaultFontFamily: "Microsoft Sans Serif",
				}
			: { loadSystemFonts: true },
		imageRendering: 1,
		fitTo: { mode: "width", value: OG_CARD_WIDTH },
	});

	return pngResponse(rendered.asPng());
};
