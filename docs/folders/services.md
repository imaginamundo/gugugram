# src/services

Camada de **regras de negócio** da aplicação. Os services orquestram repositórios, infraestrutura (storage, email) e utilitários. Eles não conhecem HTTP nem Astro — recebem dados já validados e retornam resultados ou lançam erros tipados.

---

## `auth.ts`

Encapsula as chamadas à API interna do `better-auth`.

### `authenticateUser(identity, password)`
Autentica por e-mail ou username (detecta automaticamente via regex).

- Chama `auth.api.signInEmail` ou `auth.api.signInUsername`
- Traduz os códigos de erro do `better-auth` para mensagens em português
- Retorna `{ data, headers }` — os headers contêm os cookies de sessão

### `registerNewUser(email, username, password)`
Cria uma nova conta via `auth.api.signUpEmail`.

- Traduz erros de duplicidade (username/email já em uso)
- Retorna `{ data, headers }`

### `sendPasswordResetEmail(email, redirectTo, requestHeaders)`
Solicita o envio do e-mail de reset via `auth.api.requestPasswordReset`.

- O `better-auth` chama o callback `sendResetPassword` configurado em `src/auth.ts`
- Lança `AuthErrors.RESET_REQUEST_FAILED` em caso de falha

### `performPasswordReset(newPassword, token, requestHeaders)`
Efetiva a troca de senha via `auth.api.resetPassword`.

- Lança `AuthErrors.RESET_FAILED` em caso de falha

---

## `imagePost.ts`

Gerencia posts de imagem: upload, leitura, deleção e comentários.

### `getLatestImagePosts()`
Retorna os 120 posts mais recentes com autor e contagem de comentários.

**Usado em:** `src/pages/index.astro`

### `getImagePosts(username)`
Retorna todos os posts de um usuário específico.

**Usado em:** `src/pages/[username]/index.astro`

### `getImagePost(id)`
Retorna um post com seus comentários completos (autor de cada comentário incluso).

**Usado em:** `src/pages/[username]/[postId].astro`

### `getImagePostComments(postId)`
Retorna apenas os comentários de um post.

### `processAndUploadImagePost(userId, file, description?)`
Pipeline completo de upload:
1. Valida tamanho do arquivo (máx. 60KB)
2. Verifica rate limit de 5s desde o último post do usuário
3. Lê dimensões da imagem com `image-size`
4. Valida que é quadrada e tem dimensão permitida (5, 10, 15, 30 ou 60px)
5. Faz upload via `storage.upload()` (UploadThing)
6. Sanitiza a descrição com `sanitize-html`
7. Insere no banco — se falhar, deleta a imagem do storage (rollback manual)

### `removeImagePost(userId, postId, imageUrl)`
Remove um post verificando ownership (DELETE com `AND authorId = userId`).
Depois deleta a imagem do UploadThing.

### `addImageComment(userId, imageId, body)`
Adiciona comentário com rate limit de 5s, sanitização HTML e verificação de existência do post.

### `removeImageComment(userId, commentId)`
Remove comentário — permite que o autor do comentário **ou** o dono do post deletem.

---

## `message.ts`

Gerencia recados entre usuários.

### `getMessages(username)`
Retorna todas as mensagens recebidas por um usuário, com dados do autor.

**Usado em:** `src/pages/[username]/recados.astro`

### `updateLastRead(userId, session, unreadMessagesCount)`
Atualiza `lastCheckedMessagesAt` apenas se o visitante for o dono do perfil e houver mensagens não lidas.

### `processAndSendMessage(authorId, receiverId, body)`
Envia mensagem com:
- Validação de auto-envio (não pode enviar para si mesmo)
- Rate limit de 5s
- Sanitização HTML do corpo

### `deleteMessage(userId, messageId)`
Remove mensagem verificando se o usuário é autor **ou** destinatário.

### `updateLastCheckedMessages(userId)`
Atualiza o timestamp de última leitura diretamente (usado pela action `markMessagesAsRead`).

---

## `user/profile.ts`

Gerencia dados de perfil e contexto de relacionamento entre usuários.

### `getProfile({ username, session })`
Função central usada em todas as páginas de perfil. Retorna:
- Dados do usuário (`id`, `username`, `image`, `description`)
- Status de amizade com o visitante (se autenticado)
- Contagem de amigos aceitos
- Total de recados recebidos
- Contagem de solicitações pendentes (só para o dono do perfil)
- Contagem de mensagens não lidas (só para o dono do perfil)

**Usado em:** `src/pages/[username]/index.astro`, `recados.astro`, `amigos.astro`, `[postId].astro`

### `updateProfileData(userId, data)`
Atualiza username, email, descrição e imagem de perfil.
- Se `profileImage` for uma string base64, converte para `File`, faz upload no UploadThing e agenda deleção da imagem antiga
- Trata erro de constraint única do PostgreSQL (código `23505`)

### `removeProfileImageFromUser(userId)`
Deleta a imagem do UploadThing e limpa o campo `image` no banco.

---

## `user/friends.ts`

Gerencia o sistema de amizades.

### `getFriends(userId, session?)`
Retorna `{ friends, friendRequests }`.
- `friends`: amizades aceitas (em ambas as direções)
- `friendRequests`: solicitações pendentes recebidas (visível apenas para o dono do perfil)

**Usado em:** `src/pages/[username]/amigos.astro`

### `processFriendRequest(requesterId, targetId)`
Lógica de envio de solicitação com detecção de solicitação reversa:
- Se já existe uma solicitação do `targetId` para o `requesterId`, aceita automaticamente
- Caso contrário, cria uma nova solicitação `pending`
- Retorna `"accepted"` ou `"pending"`

### `acceptPendingFriendRequest(requesterId, targetId)`
Aceita uma solicitação pendente existente.

### `deleteFriendship(userId1, userId2)`
Remove a amizade independente da direção original da solicitação.

---

## `user/search.ts`

### `getUsers({ query, session })`
Busca usuários por username (case-insensitive, `ILIKE`).
- Se autenticado: exclui o próprio usuário dos resultados e inclui o status de amizade com cada resultado
- Se guest: retorna apenas dados básicos sem contexto de amizade
- Retorna no máximo 20 resultados
- Retorna array vazio se a query estiver em branco

**Usado em:** `src/pages/buscar.astro`
