/* eslint-disable @typescript-eslint/triple-slash-reference */
/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

declare namespace App {
	interface Locals {
		user: typeof import("@auth").auth.$Infer.Session.user | null;
		session: import("better-auth").Session | null;
	}
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
