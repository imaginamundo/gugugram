import type { APIRoute } from "astro";
import { Resvg } from "@resvg/resvg-js";
import { getImagePost } from "@services/imagePost";
import { ALLOWED_IMAGE_HOSTS, buildOgCardSvg, OG_CARD_WIDTH } from "@utils/og-card";

async function fetchPostImage(url: string): Promise<Buffer | null> {
	try {
		const parsed = new URL(url);
		if (!ALLOWED_IMAGE_HOSTS.test(parsed.host)) return null;

		const response = await fetch(url, { signal: AbortSignal.timeout(10_000) });
		if (!response.ok) return null;
		return Buffer.from(await response.arrayBuffer());
	} catch {
		return null;
	}
}

export const GET: APIRoute = async ({ params, request }) => {
	const { postId } = params;
	if (!postId) return new Response("Not found", { status: 404 });

	const post = await getImagePost(postId);

	if (!post) return new Response("Not found", { status: 404 });

	const requestUrl = new URL(request.url);
	const imageUrl = post.image.startsWith("http")
		? post.image
		: new URL(post.image, requestUrl.origin).toString();

	const svg = buildOgCardSvg(imageUrl, post.username);

	const resvg = new Resvg(svg, {
		font: {
			loadSystemFonts: true,
		},
		imageRendering: 1,
		fitTo: { mode: "width", value: OG_CARD_WIDTH },
	});

	const unresolved = resvg.imagesToResolve();
	if (unresolved.length > 0) {
		const image = await fetchPostImage(unresolved[0]);
		if (image) resvg.resolveImage(unresolved[0], image);
	}

	const png = resvg.render().asPng();

	return new Response(new Uint8Array(png), {
		headers: {
			"Content-Type": "image/png",
			"Cache-Control": "public, max-age=31536000, immutable",
		},
	});
};
