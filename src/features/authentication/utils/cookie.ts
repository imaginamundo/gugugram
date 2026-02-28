// src/utils/cookie.ts (ou onde você deixou)
import type { AstroCookies } from "astro";

export function applySetCookie(headers: Headers, cookies: AstroCookies) {
	const setCookies = headers.getSetCookie();

	if (!setCookies || setCookies.length === 0) return;

	setCookies.forEach((cookieStr) => {
		const parts = cookieStr.split(";").map((p) => p.trim());
		const [nameValue, ...attributes] = parts;
		const [name, value] = nameValue.split("=");

		if (!name || value === undefined) return;

		const options: any = {};
		attributes.forEach((attr) => {
			const [key, val] = attr.split("=");
			const lowerKey = key.toLowerCase();

			if (lowerKey === "path") options.path = val;
			else if (lowerKey === "domain") options.domain = val;
			else if (lowerKey === "max-age") options.maxAge = parseInt(val);
			else if (lowerKey === "expires") options.expires = new Date(val);
			else if (lowerKey === "secure") options.secure = true;
			else if (lowerKey === "httponly") options.httpOnly = true;
			else if (lowerKey === "samesite") {
				options.sameSite = val.toLowerCase() as "lax" | "strict" | "none";
			}
		});

		cookies.set(name, decodeURIComponent(value), options);
	});
}
