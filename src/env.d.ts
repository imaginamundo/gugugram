/* eslint-disable @typescript-eslint/triple-slash-reference */
/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

declare namespace App {
	interface Locals {
		user: typeof import("@auth/auth").auth.$Infer.Session.user | null;
		session: import("better-auth").Session | null;
	}
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}

interface ImportMetaEnv {
	readonly POSTGRES_URL: string;
	readonly AUTH_SECRET: string;
	readonly UPLOADTHING_TOKEN: string;
	readonly MAILER_SERVICE: string;
	readonly MAILER_HOST: string;
	readonly MAILER_USER: string;
	readonly MAILER_PASSWORD: string;
}
