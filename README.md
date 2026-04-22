<h1>
  <p align="center">
    <img src="./public/seo/512.png" alt="logo" width="128">
     <br>Gugugram
  </p>
</h1>

<p align="center">
    Rede social de pixel art para criar e compartilhar imagens
  <br /> <br />
  <a href="#setup-and-build">Setup/Build</a>
  ·
  <a href="#arquitetura">Arquitetura</a>
  ·
  <a href="#packages">Packages</a>
</p>

<br/><br/>

## Setup and Build

## Setup
- Clone o projeto:
  - `git clone <url-do-repositorio>`
  - `cd gugugram`
- Crie seu arquivo de ambiente com base no modelo:
  - `cp .env.sample .env`
- Instale as dependencias:
  - `npm install`
- Gere e aplique migrations do banco:
  - `npm run db:generate`
  - `npm run db:migrate`

### Build
- Gere build de producao antes de abrir PR:
  - `npm run build` (Astro build SSR para adapter Vercel)
- Rode as validacoes do projeto:
  - `npm run check`
  - `npm run lint`
  - `npm run test`


## Arquitetura
### Stack principal
- Framework: Astro 6 (`output: "server"`).
- UI interativa: Svelte 5.
- Banco: PostgreSQL (Neon) com Drizzle ORM.
- Auth: better-auth.
- Storage: UploadThing.
- Observabilidade: Sentry + PostHog.

### Estrutura base do `src/`
- `public/`: arquivos estaticos (imagens, icones, SEO).
- `src/pages/`: rotas file-based do Astro.
- `src/components/`: UI (`.astro` e `.svelte`).
- `src/actions/`: server actions de escrita.
- `src/services/`: regras de negocio.
- `src/repositories/`: queries com Drizzle.
- `src/infra/`: clientes de integracao externa (DB/storage).
- `src/middleware/`: pipeline de requisicao.
- `src/stores/`, `src/utils/`, `src/types/`: estado client, utilitarios e contratos.

## Packages
- `astro`, `@astrojs/svelte`, `@astrojs/vercel`,  `@astrojs/check`
- `svelte`.
- `better-auth`.
- `drizzle-orm`, `drizzle-kit`
- `uploadthing`.
- `posthog-js`, `posthog-node`.
- `nodemailer`.
- `@sentry/astro`,
- `@neondatabase/serverless`

