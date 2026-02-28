import { UTApi } from "uploadthing/server";

export const utapi = new UTApi({
	token: import.meta.env.UPLOADTHING_TOKEN,
});
