import { UTApi } from "uploadthing/server";
import { UPLOADTHING_TOKEN } from "astro:env/server";

export const utapi = new UTApi({
	token: UPLOADTHING_TOKEN,
});
