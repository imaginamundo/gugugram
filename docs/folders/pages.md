# src/pages

Rotas da aplicação. O Astro usa file-based routing — cada arquivo `.astro` ou `.ts` vira uma rota automaticamente.

Todas as páginas `.astro` usam o layout `src/components/_layout/Main.astro` e têm acesso à sessão via `Astro.locals.user`.

---

## Rotas Públicas

### `index.astro` → `/`
Página inicial. Busca os 120 posts mais recentes via `getLatestImagePosts()` e renderiza o grid com `ImagePostList`.

### `entrar.astro` → `/entrar`
Formulário de login.
- Submete para `actions.login`
- Em caso de sucesso: redireciona para `/{username}`
- Exibe erros de campo e erros gerais

### `cadastrar.astro` → `/cadastrar`
Formulário de cadastro.
- Submete para `actions.register`
- Em caso de sucesso: redireciona para `/{username}`

### `esqueci-minha-senha.astro` → `/esqueci-minha-senha`
Formulário de recuperação de senha.
- Submete para `actions.requestPasswordReset`
- Exibe mensagem genérica de confirmação (não revela se o e-mail existe)

### `nova-senha.astro` → `/nova-senha`
Formulário de redefinição de senha.
- Requer `?token=` na URL (enviado por e-mail) — redireciona para `/entrar` se ausente
- Submete para `actions.resetPassword`
- Em caso de sucesso: redireciona para `/entrar`

### `buscar.astro` → `/buscar?q=`
Página de busca de usuários.
- Lê o parâmetro `q` da query string
- Chama `getUsers({ query, session })` — retorna resultados com contexto de amizade se autenticado
- Renderiza `UsersList` com os resultados
- `robots: noindex,follow`

### `sobre.astro` → `/sobre`
Página estática sobre o projeto.

### `components.astro` → `/components`
Página de showcase dos componentes de UI (uso interno/desenvolvimento).

### `404.astro` → `/404`
Página de erro 404.

### `500.astro` → `/500`
Página de erro 500.

### `sitemap.xml.ts` → `/sitemap.xml`
Gera o sitemap XML da aplicação.

---

## Rotas de Perfil — `[username]/`

Rotas dinâmicas baseadas no username do usuário. Todas retornam 404 se o usuário não existir.

### `[username]/index.astro` → `/{username}`
Perfil do usuário — aba Fotos.
- Carrega perfil via `getProfile({ username, session })`
- Carrega posts via `getImagePosts(username)`
- Renderiza `ProfileHeader` + `ProfileTabs` (selectedTab="fotos") + `ImagePostList`

### `[username]/recados.astro` → `/{username}/recados`
Perfil do usuário — aba Recados.
- Carrega perfil, mensagens via `getMessages(username)`
- Chama `updateLastRead()` para marcar mensagens como lidas se o visitante for o dono
- Renderiza `ProfileHeader` + `ProfileTabs` (selectedTab="recados") + `Messages`

### `[username]/amigos.astro` → `/{username}/amigos`
Perfil do usuário — aba Amigos.
- Carrega perfil, amigos via `getFriends(user.id, session)`
- Renderiza `ProfileHeader` + `ProfileTabs` (selectedTab="amigos") + `FriendsList`

### `[username]/[postId].astro` → `/{username}/{postId}`
Página de detalhe de um post.
- Carrega post via `getImagePost(postId)` — 404 se não existir ou username não bater
- Gera URL de Open Graph dinâmica apontando para `/api/og/{postId}`
- Renderiza `ProfileHeader` + `ImagePostDetails` + `DeleteImagePost` (se for o autor)
- Ao deletar o post: redireciona para `/{username}`

---

## Rotas Protegidas

### `editar-perfil.astro` → `/editar-perfil`
Formulário de edição de perfil.
- Protegida pelo middleware `_protectedRoutes.ts` — redireciona para `/entrar` se não autenticado
- Carrega dados atuais do perfil via `getProfile()`
- Submete para `actions.updateProfile`
- Em caso de sucesso: redireciona para `/{username}`
- Exibe `RemoveProfilePicture` se o usuário tiver foto de perfil customizada

---

## API Routes — `api/`

### `api/auth/[...all].ts` → `/api/auth/*`
Catch-all que delega todas as requisições para o handler do `better-auth`.
Gerencia: login, registro, sessão, reset de senha, etc.

### `api/logout.ts` → `/api/logout` (POST)
Encerra a sessão via `auth.api.signOut()`, captura evento no PostHog e redireciona para `/`.

### `api/og/[postId].ts` → `/api/og/{postId}` (GET)
Gera imagem Open Graph dinâmica para compartilhamento de posts.
- Busca o post via `getImagePost(postId)`
- Renderiza um template HTML com `satori-html`
- Converte para SVG com `satori` e depois para PNG com `@resvg/resvg-js`
- Retorna PNG com cache imutável de 1 ano (`Cache-Control: public, max-age=31536000, immutable`)

### `api/log/sentry.ts` → `/api/log/sentry`
Endpoint para o tunnel do Sentry (evita bloqueio por ad-blockers).

### `api/post/[postId]/` → `/api/post/{postId}/*`
Rotas de API relacionadas a posts específicos.
