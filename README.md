# Gugugram

A social network ("a rede social da galera!") built with Astro and Svelte, deployed on Vercel.

## Architecture

### Overview

Gugugram is an SSR application: Astro 7 running on Vercel serverless functions, backed by PostgreSQL on Neon. Svelte 5 components handle the UI, better-auth provides authentication, and the codebase is organized into strict dependency layers enforced by `eslint-plugin-boundaries`.

1. Every request passes through the Astro middleware (`src/middleware/`): `_authentication` restores the better-auth session, `_checkOrigin` validates request origins (the built-in Astro check is disabled in `astro.config.js`), and `_protectedRoutes` guards private pages.
2. Routes dispatch to pages (rendering Svelte components), Astro actions, or API routes.
3. Page handlers and actions delegate to `services`, which implement domain logic and coordinate cross-cutting concerns (auth, email, observability).
4. Services query through `repositories`, which own the data access against the database client in `infra`.
5. External concerns are isolated in `infra` (database, storage, uploadthing) and dedicated modules (email, observability).

### Layers

Import boundaries are enforced by `eslint-plugin-boundaries`; dependencies point downward and anything not listed is a lint error (`npm run lint`).

| Layer | Responsibility | May import |
| --- | --- | --- |
| `pages` | Routes (pages + API) | services, components, stores, observability, schemas, types, utils, styles, auth |
| `components` | Svelte UI | components, stores, services, utils, types, schemas, assets, styles |
| `actions` | Astro actions | actions, services, observability, schemas, types, utils, auth |
| `services` | Domain logic | repositories, infra, schemas, types, utils, auth |
| `repositories` | Data access (queries) | infra, schemas, types, utils |
| `infra` | External clients (database, storage, uploadthing) | schemas, types, utils |
| `middleware` | Request pre-processing | middleware, types, utils, auth |
| `email` / `observability` | Cross-cutting concerns | types, utils |
| `schemas` / `utils` / `types` / `assets` / `styles` | Shared base | types, utils (leaf layers) |

`src/auth.ts` is a special file category: only `actions`, `services`, `pages`, and `middleware` may import it, and it may only import `infra`, `email`, `schemas`, `types`, and `utils`. Tests (`src/__tests__/**`) and CSS files are exempt.

### Key subsystems

- **Auth** — better-auth at `src/auth.ts` (username/password, drizzle adapter). Sessions are exposed via `App.Locals`; routes under `/api/auth`.
- **Data** — Drizzle schema in `src/schemas/database.ts` (tables prefixed `gugugram_*`), migrations in `drizzle/` via `npm run db:generate` / `npm run db:migrate`.
- **Email** — nodemailer SMTP transport in `src/email/` with templates (e.g., reset-password).
- **Uploads** — uploadthing client in `src/infra/uploadthing.ts`; images are served from the uploadthing CDN.
- **OG images** — dynamic PNG generation at `/api/og/[postId]`: satori renders HTML to SVG (including a built-in SSRF guard for image fetches) and `@resvg/resvg-js` rasterizes it, served with an immutable cache header.
- **Observability** — Sentry (client + server) and PostHog (`posthog-js` / `posthog-node`), plus a custom logger and tracking utilities in `src/observability/`.
- **Security** — sanitize-html for user-generated content, rate limiting (`src/utils/rate-limit.ts`), origin checks, and server-only secrets via `astro:env`.

### Environment

Configuration is declared with `astro:env` in `astro.config.js`: server secrets (`POSTGRES_URL`, `AUTH_SECRET`, `UPLOADTHING_TOKEN`, mailer and Sentry credentials) and public values (`POSTHOG_KEY`, `SENTRY_DSN`). The app targets Node 24.x and is deployed on Vercel with the `@astrojs/vercel` adapter.
