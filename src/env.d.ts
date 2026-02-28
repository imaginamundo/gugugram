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
	readonly PUBLIC_BASE_URL: string;
	readonly DB_URL: string;
	readonly POSTGRES_URL: string;
	readonly POSTGRES_PRISMA_URL: string;
	readonly POSTGRES_URL_NO_SSL: string;
	readonly POSTGRES_URL_NON_POOLING: string;
	readonly POSTGRES_USER: string;
	readonly POSTGRES_HOST: string;
	readonly POSTGRES_PASSWORD: string;
	readonly POSTGRES_DATABASE: string;
	readonly AUTH_SECRET: string;
	readonly UPLOADTHING_SECRET: string;
	readonly UPLOADTHING_APP_ID: string;
	readonly SENTRY_AUTH_TOKEN: string;
	readonly PUBLIC_POSTHOG_KEY: string;
	readonly PUBLIC_POSTHOG_HOST: string;
	readonly KV_URL: string;
	readonly KV_REST_API_URL: string;
	readonly KV_REST_API_TOKEN: string;
	readonly KV_REST_API_READ_ONLY_TOKEN: string;
	readonly MAILER_SERVICE: string;
	readonly MAILER_HOST: string;
	readonly MAILER_USER: string;
	readonly MAILER_PASSWORD: string;
}
