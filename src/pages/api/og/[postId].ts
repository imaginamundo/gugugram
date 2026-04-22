import type { APIRoute } from "astro";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { html } from "satori-html";
import { getImagePost } from "@services/imagePost";

const fontFile = await fetch("https://og-playground.vercel.app/inter-latin-ext-700-normal.woff");
const fontData = await fontFile.arrayBuffer();

export const GET: APIRoute = async ({ params, request }) => {
	const { postId } = params;
	if (!postId) return new Response("Not found", { status: 404 });

	const post = await getImagePost(postId);

	if (!post) return new Response("Not found", { status: 404 });

	const requestUrl = new URL(request.url);
	const imageUrl = post.image.startsWith("http")
		? post.image
		: new URL(post.image, requestUrl.origin).toString();

	const markup = html`
		<div
			style="display: flex; background-color: #008080; width: 100%; height: 100%; padding: 40px; justify-content: center; align-items: center;"
		>
			<div
				style="display: flex; flex-direction: column; background-color: #c0c0c0; width: 100%; height: 100%; border-top: 4px solid #ffffff; border-left: 4px solid #ffffff; border-right: 4px solid #808080; border-bottom: 4px solid #808080; box-shadow: 10px 10px 0px rgba(0,0,0,0.5);"
			>
				<div
					style="display: flex; background-color: #000080; color: #ffffff; font-size: 30px; font-weight: bold; align-items: center;"
				>
					<div style="margin: 10px 20px">Gugugram - A rede social da galera!</div>
				</div>

				<div style="display: flex; flex-direction: row; padding: 30px; gap: 40px; height: 89%;">
					<img
						src="${imageUrl}"
						style="width: 450px; height: 100%; object-fit: cover; border-top: 4px solid #808080; border-left: 4px solid #808080; border-right: 4px solid #ffffff; border-bottom: 4px solid #ffffff;"
					/>

					<div
						style="display: flex; flex-direction: column; justify-content: space-between; flex: 1;"
					>
						<div style="display: flex; flex-direction: column;">
							<h1 style="font-size: 50px; margin: 0; color: #000;">${post.username}</h1>
							<p style="font-size: 30px; color: #333; margin-top: 10px;">Compartilhou uma foto!</p>
						</div>

						<div
							style="display: flex; background-color: #ffffff; padding: 20px; border-top: 4px solid #808080; border-left: 4px solid #808080; border-right: 4px solid #ffffff; border-bottom: 4px solid #ffffff; font-size: 28px; color: #000;"
						>
							Ver a foto original e ler os comentários na página!
						</div>
					</div>
				</div>
			</div>
		</div>
	`;

	const svg = await satori(markup, {
		width: 1200,
		height: 630,
		fonts: [{ name: "Inter", data: fontData, weight: 700, style: "normal" }],
	});

	const resvg = new Resvg(svg, { fitTo: { mode: "width", value: 1200 } });
	const pngBuffer = resvg.render().asPng();
	const webData = new Uint8Array(pngBuffer);

	return new Response(webData, {
		headers: {
			"Content-Type": "image/png",
			"Cache-Control": "public, max-age=31536000, immutable",
		},
	});
};
