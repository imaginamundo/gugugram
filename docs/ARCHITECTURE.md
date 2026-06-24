# ARCHITECTURE.md — Gugugram

Documentação arquitetural do Gugugram

---

## 1. Stack

| Camada              | Tecnologia                           |
| ------------------- | ------------------------------------ |
| Framework           | Astro 6 (SSR, output: server)        |
| UI interativa       | Svelte 5 (Runes)                     |
| Banco de dados      | PostgreSQL via Neon (serverless)     |
| ORM                 | Drizzle ORM                          |
| Autenticação        | better-auth                          |
| Storage de arquivos | UploadThing                          |
| Deploy              | Vercel (adapter `@astrojs/vercel`)   |
| E-mail              | Nodemailer                           |
| Observabilidade     | Sentry (erros) + PostHog (analytics) |
| Validação           | Zod                                  |
| Testes              | Vitest + Testing Library             |

---

## 2. Estrutura de Pastas

```
src/
├── actions/        # Server Actions do Astro (entrada de mutações)
├── components/     # Componentes de UI (Astro + Svelte)
├── docs/           # Documentação técnica
│   └── folders/    # Docs por pasta
├── email/          # Templates e envio de e-mail transacional
├── infra/          # Clientes de serviços externos (DB, storage)
├── middleware/     # Pipeline de requisição (CSRF, auth, rotas protegidas)
├── observability/  # Logger (Sentry) e tracking de eventos (PostHog)
├── pages/          # Rotas file-based do Astro
├── repositories/   # Queries de banco de dados (Drizzle)
├── schemas/        # Schema do banco (Drizzle) e schemas de validação (Zod)
├── services/       # Regras de negócio
├── stores/         # Estado client-side (Svelte 5 Runes)
├── styles/         # CSS global
├── types/          # Tipos TypeScript globais e códigos de erro
└── utils/          # Funções utilitárias puras
```

### Responsabilidade de cada pasta

| Pasta            | Responsabilidade                                                       | Depende de                                          |
| ---------------- | ---------------------------------------------------------------------- | --------------------------------------------------- |
| `pages/`         | Rotas, composição de dados para a UI, redirecionamentos                | `services/`, `actions/`                             |
| `actions/`       | Recebe input de formulários, valida, chama services, retorna resultado | `services/`, `utils/`, `schemas/`, `observability/` |
| `services/`      | Regras de negócio, orquestração de repositórios e infra                | `repositories/`, `infra/`, `utils/`, `types/`       |
| `repositories/`  | Queries SQL via Drizzle ORM                                            | `infra/database`, `schemas/database`                |
| `infra/`         | Instâncias de clientes externos (DB, UploadThing)                      | Variáveis de ambiente                               |
| `middleware/`    | Pipeline de cada requisição HTTP                                       | `auth.ts`                                           |
| `schemas/`       | Definição das tabelas do banco e schemas Zod de formulários            | —                                                   |
| `components/`    | Renderização de UI (Astro = SSR, Svelte = client-side)                 | `services/`, `stores/`, `utils/`                    |
| `stores/`        | Estado reativo global no cliente                                       | —                                                   |
| `observability/` | Logging de erros e rastreamento de eventos                             | Sentry SDK, PostHog SDK                             |
| `email/`         | Envio de e-mails transacionais                                         | Nodemailer, variáveis de ambiente                   |
| `types/`         | Contratos de erro e tipos de domínio                                   | —                                                   |
| `utils/`         | Funções puras reutilizáveis                                            | —                                                   |

---

## 3. Arquitetura Geral

### Padrão: Layered Architecture (Arquitetura em Camadas)

O projeto segue uma separação clara de responsabilidades em camadas verticais, onde cada camada só conhece a camada imediatamente abaixo dela:

```
┌─────────────────────────────────────────┐
│           pages/ + components/          │  ← Apresentação (SSR + Client)
├─────────────────────────────────────────┤
│               actions/                  │  ← Entrada de mutações (Server Actions)
├─────────────────────────────────────────┤
│               services/                 │  ← Regras de negócio
├─────────────────────────────────────────┤
│             repositories/               │  ← Acesso a dados
├─────────────────────────────────────────┤
│                infra/                   │  ← Clientes externos (DB, Storage)
└─────────────────────────────────────────┘
```

**Fluxo de leitura (GET):**

`page.astro` → `service` → `repository` → `infra/database` → PostgreSQL

---

**Fluxo de escrita (POST via form):**

`page.astro` → `action` → `service` → `repository` → `infra/database` → PostgreSQL

ou

`page.astro` → `action` → `service`→ `infra/storage` → Upload

### Separação Astro/Svelte

O projeto usa dois frameworks de componentes com papéis distintos:

- **Astro (`.astro`)**: renderização no servidor, sem JavaScript no cliente por padrão. Usado para layout, páginas e componentes puramente informativos.
- **Svelte 5 (`.svelte`)**: hidratado no cliente com `client:load` ou `client:idle`. Usado para interatividade: modais, formulários com feedback, botões de ação.

---

## 4. Padrões e Decisões Técnicas

### 4.1 Server Actions como camada de entrada de mutações

Todas as operações de escrita passam por **Astro Server Actions** (`src/actions/`). Isso centraliza:

- Validação de schema (Zod via `parseSchema()`)
- Verificação de autenticação (via `withAuth()`)
- Chamada ao service correto
- Retorno tipado de sucesso/erro para a UI

```ts
// Padrão de uma action protegida
export const uploadImagePost = defineAction({
  accept: "form",
  handler: withAuth(async (input, context, session) => {
    const { fields, success } = parseSchema(input, UploadImageSchema);
    if (!success) return { success: false, error: "Dados inválidos." };
    // ...chama service
  }),
});
```

### 4.2 Higher-Order Function para autenticação: `withAuth`

Em vez de repetir a verificação de sessão em cada action, o projeto usa um wrapper HOF em `src/utils/action-guard.ts`:

```ts
export function withAuth(handler) {
  return async (input, context) => {
    const session = context.locals.user;
    if (!session) return { success: false, error: "Não autenticado." };
    return handler(input, context, session);
  };
}
```

Isso garante que o `session` passado ao handler é sempre não-nulo, sem necessidade de checagem manual.

### 4.3 Repository Pattern

Cada entidade do banco tem seu próprio repositório (`src/repositories/`), que é um objeto com métodos de query. Os services nunca importam `db` diretamente — sempre passam pelo repositório correspondente.

Isso isola as queries e facilita testes unitários (os repositórios podem ser mockados).

### 4.4 Códigos de erro tipados

Em vez de strings mágicas, o projeto usa constantes de erro por domínio em `src/types/errors.ts`:

```ts
// No service:
throw new Error(ImagePostErrors.FILE_TOO_LARGE)

// Na action:
case ImagePostErrors.FILE_TOO_LARGE:
  message = "Imagem muito grande. O tamanho máximo é 60KB."
```

Isso cria um contrato explícito entre service e action, evitando erros de digitação e facilitando o tratamento granular de erros na UI.

### 4.5 Abstração de Storage

O acesso ao UploadThing é feito exclusivamente via `src/infra/storage.ts`, que expõe apenas `upload(file)` e `delete(key)`. Os services nunca importam `utapi` diretamente. Isso permite trocar o provider de storage sem alterar nenhum service.

### 4.6 Rate limiting baseado em timestamp

O rate limit é implementado de forma simples e sem estado externo (sem Redis): antes de inserir um post ou comentário, o sistema busca o registro mais recente do usuário e compara o timestamp com `Date.now()`. Implementado em `src/utils/rate-limit.ts` e aplicado nos services de `imagePost` e `message`.

### 4.7 Rollback manual de storage

No upload de posts, se a inserção no banco falhar após o upload da imagem, o sistema deleta a imagem do UploadThing manualmente:

```ts
// src/services/imagePost.ts
try {
  await imagePostRepository.insertPost(...)
} catch {
  const imageKey = upload.data.ufsUrl.split("/").pop()
  if (imageKey) await storage.delete(imageKey)
  throw new Error(ImagePostErrors.DB_INSERT_FAILED)
}
```

Decisão consciente de não usar transações distribuídas — o rollback manual é suficiente para o caso de uso.

### 4.8 Middleware em pipeline sequencial

O middleware do Astro é composto com `sequence()` em ordem explícita:

```
checkOrigin → authentication → protectedRoutes
```

- `checkOrigin`: bloqueia CSRF antes de qualquer processamento
- `authentication`: popula `context.locals.user` para todas as rotas
- `protectedRoutes`: redireciona rotas que exigem login

### 4.9 Estado client-side com Svelte 5 Runes

O único estado global client-side é o `imagePostModalStore` em `src/stores/`, implementado com `$state` do Svelte 5. É um objeto singleton que controla qual post está aberto no modal global renderizado no layout.

### 4.10 Open Graph dinâmico

A rota `src/pages/api/og/[postId].ts` gera imagens PNG de Open Graph em tempo real usando `satori` (HTML → SVG) e `@resvg/resvg-js` (SVG → PNG). O resultado é cacheado por 1 ano no CDN da Vercel (`Cache-Control: immutable`).

### 4.11 Observabilidade em duas camadas

- **Erros**: `src/observability/logger.ts` integra `console` com Sentry. Qualquer `logger.error()` captura a exceção no Sentry com contexto e metadata.
- **Eventos de usuário**: `src/observability/tracking-server.ts` encapsula o PostHog Node.js. Como o ambiente é serverless (Vercel), `flushServerEvents()` é chamado ao final de cada action para forçar o envio antes da função encerrar.

### 4.12 Amizade bidirecional com aceitação automática

O sistema de amizades usa uma única tabela `userFriends` com `requestUserId` e `targetUserId`. A lógica de `processFriendRequest` verifica se já existe uma solicitação no sentido inverso antes de criar uma nova — se existir, aceita automaticamente. Isso elimina a necessidade de um estado "mutual pending".

---

## 5. Fluxo de Dados por Feature

### Autenticação

```
entrar.astro
  └─ actions.login (form POST)
       └─ services/auth.authenticateUser()
            └─ better-auth API (signInEmail / signInUsername)
                 └─ PostgreSQL (gugugram_accounts, gugugram_sessions)
                      └─ cookie de sessão → context.locals.user (via middleware)
```

### Upload de Post

```
UploadImagePostModal.svelte
  └─ actions.uploadImagePost (form POST)
       └─ withAuth() → session garantida
            └─ services/imagePost.processAndUploadImagePost()
                 ├─ checkRateLimit() → repositories/imagePost.getLatestPostByAuthor()
                 ├─ imageSize() → valida dimensões
                 ├─ infra/storage.upload() → UploadThing
                 └─ repositories/imagePost.insertPost() → PostgreSQL
```

### Visualização de Perfil

```
[username]/index.astro (SSR)
  ├─ services/user/profile.getProfile() → múltiplas queries paralelas no PostgreSQL
  └─ services/imagePost.getImagePosts() → PostgreSQL
       └─ ProfileHeader + ProfileTabs + ImagePostList (renderizados no servidor)
            └─ ImagePost.svelte (client:load) → ao clicar → imageModalStore.post = post
                 └─ ImagePostModal.svelte reage → exibe modal
```

### Reset de Senha

```
esqueci-minha-senha.astro
  └─ actions.requestPasswordReset
       └─ services/auth.sendPasswordResetEmail()
            └─ better-auth.api.requestPasswordReset()
                 └─ callback sendResetPassword → email/email.sendEmail()
                      └─ Nodemailer → SMTP

[link no e-mail] → nova-senha.astro?token=...
  └─ actions.resetPassword
       └─ services/auth.performPasswordReset()
            └─ better-auth.api.resetPassword()
```

---

## 6. Rotas

### Públicas

| Rota                   | Arquivo                           | Descrição                |
| ---------------------- | --------------------------------- | ------------------------ |
| `/`                    | `pages/index.astro`               | Feed de posts recentes   |
| `/entrar`              | `pages/entrar.astro`              | Login                    |
| `/cadastrar`           | `pages/cadastrar.astro`           | Registro                 |
| `/buscar?q=`           | `pages/buscar.astro`              | Busca de usuários        |
| `/esqueci-minha-senha` | `pages/esqueci-minha-senha.astro` | Solicitar reset de senha |
| `/nova-senha?token=`   | `pages/nova-senha.astro`          | Redefinir senha          |
| `/sobre`               | `pages/sobre.astro`               | Página estática          |
| `/{username}`          | `pages/[username]/index.astro`    | Perfil — aba Fotos       |
| `/{username}/recados`  | `pages/[username]/recados.astro`  | Perfil — aba Recados     |
| `/{username}/amigos`   | `pages/[username]/amigos.astro`   | Perfil — aba Amigos      |
| `/{username}/{postId}` | `pages/[username]/[postId].astro` | Detalhe de post          |

### Protegidas (requer autenticação)

| Rota             | Arquivo                     | Proteção                         |
| ---------------- | --------------------------- | -------------------------------- |
| `/editar-perfil` | `pages/editar-perfil.astro` | `middleware/_protectedRoutes.ts` |

### API

| Rota               | Arquivo                      | Descrição               |
| ------------------ | ---------------------------- | ----------------------- |
| `/api/auth/*`      | `pages/api/auth/[...all].ts` | Handler do better-auth  |
| `/api/logout`      | `pages/api/logout.ts`        | Encerrar sessão         |
| `/api/og/{postId}` | `pages/api/og/[postId].ts`   | Gerar imagem Open Graph |
| `/api/log/sentry`  | `pages/api/log/sentry.ts`    | Tunnel do Sentry        |

---

## 7. Banco de Dados

### Tabelas principais

```
gugugram_users
  ├── id (PK)
  ├── username (UNIQUE)
  ├── email (UNIQUE)
  ├── image (URL UploadThing)
  ├── description
  └── lastCheckedMessagesAt

gugugram_images_posts
  ├── id (UUID)
  ├── image (URL UploadThing)
  ├── description
  └── authorId → gugugram_users (CASCADE DELETE)

gugugram_image_post_comments
  ├── id (UUID)
  ├── body
  ├── imageId → gugugram_images_posts (CASCADE DELETE)
  └── authorId → gugugram_users (CASCADE DELETE)

gugugram_messages
  ├── id (UUID)
  ├── body
  ├── authorId → gugugram_users (CASCADE DELETE)
  └── receiverId → gugugram_users (CASCADE DELETE)

gugugram_user_friends
  ├── id (UUID)
  ├── requestUserId → gugugram_users (CASCADE DELETE)
  ├── targetUserId → gugugram_users (CASCADE DELETE)
  ├── status (enum: pending | accepted)
  └── UNIQUE(requestUserId, targetUserId)

-- Tabelas do better-auth:
gugugram_sessions
gugugram_accounts  (senha hasheada com scrypt)
gugugram_verifications
```

---

## 8. Variáveis de Ambiente

Todas as variáveis são validadas pelo Astro env schema em `astro.config.js`.

| Variável            | Contexto      | Descrição                            |
| ------------------- | ------------- | ------------------------------------ |
| `POSTGRES_URL`      | server/secret | URL de conexão PostgreSQL (Neon)     |
| `AUTH_SECRET`       | server/secret | Chave secreta do better-auth         |
| `UPLOADTHING_TOKEN` | server/secret | Token de autenticação do UploadThing |
| `MAILER_SERVICE`    | server/secret | Serviço SMTP (ex: gmail)             |
| `MAILER_HOST`       | server/secret | Host SMTP                            |
| `MAILER_USER`       | server/secret | Usuário SMTP                         |
| `MAILER_PASSWORD`   | server/secret | Senha SMTP                           |
| `POSTHOG_KEY`       | client/public | Chave do PostHog                     |
| `POSTHOG_HOST`      | server/public | Host do PostHog                      |
| `SENTRY_DSN`        | client/public | DSN do Sentry                        |
| `SENTRY_AUTH_TOKEN` | server/secret | Token para upload de source maps     |
| `SENTRY_ORG`        | server/secret | Organização no Sentry                |
| `SENTRY_PROJECT`    | server/secret | Projeto no Sentry                    |

---

## 9. Como Executar

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.sample .env
# Preencher os valores no .env

# Gerar e aplicar migrations do banco
npm run db:generate
npm run db:migrate

# Rodar em desenvolvimento
npm run dev

# Build de produção
npm run build

# Preview do build
npm run preview
```

### Scripts disponíveis

| Script                | Descrição                                |
| --------------------- | ---------------------------------------- |
| `npm run dev`         | Servidor de desenvolvimento (porta 4321) |
| `npm run build`       | Build de produção                        |
| `npm run preview`     | Preview do build local                   |
| `npm run check`       | Type-check com `astro check`             |
| `npm run lint`        | Lint com ESLint                          |
| `npm run lint:fix`    | Lint com correção automática             |
| `npm run format`      | Formatar com Prettier                    |
| `npm run test`        | Rodar testes (Vitest, modo single-run)   |
| `npm run db:generate` | Gerar migration a partir do schema       |
| `npm run db:migrate`  | Aplicar migrations pendentes             |
| `npm run db:studio`   | Abrir Drizzle Studio (UI do banco)       |
| `npm run sync`        | Sincronizar tipos do Astro               |

---

## 10. Testes

Os testes ficam em `src/__tests__/` e espelham a estrutura do `src/`:

```
src/__tests__/
├── __mocks__/          # Mocks de módulos do Astro (actions, env, middleware, zod)
├── actions/            # Testes de auth guard, propagação de erros, validação de schema
├── components/         # Testes de componentes Svelte (Button, Checkbox, ImagePost, etc.)
├── eslint/             # Testes de regras de import boundaries
├── repositories/       # Testes de ownership e deleção
├── services/           # Testes de error codes, ownership de mensagens, rate limit, sanitização
├── stores/             # Testes do imageModalStore
└── utils/              # Testes de date, emoji, validação, user utils
```

Rodar todos os testes:

```bash
npm run test
```

---

## 11. Pontos Críticos

### Rollback manual de storage

O upload de imagens não usa transação distribuída. Se o banco falhar após o upload, o sistema tenta deletar a imagem do UploadThing manualmente. Em caso de falha nessa deleção, a imagem fica órfã no storage. Monitorar via logs do Sentry.

### Rate limit sem estado externo

O rate limit é baseado em query ao banco (busca o último registro do usuário). Em alta concorrência, duas requisições simultâneas podem passar pela verificação antes que qualquer uma insira o registro. Para o volume atual do projeto, é aceitável.

### `flushServerEvents()` encerra o cliente PostHog

A função `flushServerEvents()` chama `posthog.shutdown()`, que termina permanentemente o cliente. Isso é intencional para o ambiente serverless (Vercel), onde cada invocação é isolada. Não usar em ambientes de servidor persistente.

### Sessão via cookie gerenciada pelo better-auth

O `better-auth` retorna cookies nos headers HTTP da resposta. O helper `applySetCookie()` em `src/utils/cookie.ts` transfere esses cookies para o contexto do Astro. Se esse passo for omitido em uma nova action de autenticação, a sessão não será persistida.

### Imagens com dimensões restritas

O sistema aceita apenas imagens quadradas com dimensões específicas (5, 10, 15, 30 ou 60px) e tamanho máximo de 60KB. Essa validação acontece no service (`src/services/imagePost.ts`) usando a biblioteca `image-size`. Arquivos que não atendam serão rejeitados com erro tipado.
