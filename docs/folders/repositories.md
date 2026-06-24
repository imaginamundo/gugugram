# src/repositories

Camada de **acesso a dados**. Cada repositório é um objeto com métodos que executam queries no banco via Drizzle ORM. Não contêm regras de negócio — apenas leitura e escrita no PostgreSQL (Neon).

Todos os repositórios importam `db` de `src/infra/database.ts` e os schemas de `src/schemas/database.ts`.

---

## `imagePost.ts` — `imagePostRepository`

### `getLatestPosts(limit = 120)`
Busca os posts mais recentes com autor e contagem de comentários via subquery SQL.

### `getPostsByUsername(username)`
Busca um usuário pelo username e retorna seus posts ordenados por data decrescente.

### `getPostById(id)`
Verifica existência de um post (retorna apenas o `id`).

### `getPostWithCommentsById(id)`
Busca um post completo com autor e todos os comentários (cada comentário com seu autor).

### `getLatestPostByAuthor(authorId)`
Busca o post mais recente de um autor — usado para verificar rate limit.

### `insertPost(authorId, image, description)`
Insere um novo post de imagem.

### `deletePost(postId, authorId)`
Deleta um post com verificação de ownership (`AND authorId = authorId`). Retorna as linhas deletadas — se vazio, o post não existe ou não pertence ao usuário.

### `getCommentsByPostId(postId)`
Retorna todos os comentários de um post com dados do autor, ordenados por data decrescente.

### `getLatestCommentByAuthor(authorId)`
Busca o comentário mais recente de um autor — usado para rate limit.

### `getCommentWithPostAuthor(commentId)`
Busca um comentário incluindo o `authorId` do post pai — necessário para verificar se o visitante é dono do post.

### `insertComment(imageId, authorId, body)`
Insere um novo comentário.

### `deleteComment(commentId)`
Deleta um comentário pelo ID.

---

## `message.ts` — `messageRepository`

### `getMessagesByUsername(username)`
Busca um usuário pelo username e retorna todas as mensagens recebidas com dados do autor (id, username, image).

### `getLatestMessageByAuthor(authorId)`
Busca a mensagem mais recente enviada por um autor — usado para rate limit.

### `insertMessage(authorId, receiverId, body)`
Insere uma nova mensagem.

### `getMessageById(messageId)`
Busca uma mensagem pelo ID — usado para verificar existência e ownership antes de deletar.

### `deleteMessageById(messageId)`
Deleta uma mensagem pelo ID.

### `updateLastCheckedAt(userId, date)`
Atualiza o campo `lastCheckedMessagesAt` na tabela `users` — marca o momento em que o usuário visualizou seus recados.

---

## `userFriends.ts` — `userFriendsRepository`

### `getUserWithFriendships(userId)`
Busca um usuário com todas as suas amizades:
- `targetedFriends`: solicitações onde o usuário é o alvo (aceitas e pendentes)
- `requestedFriends`: solicitações onde o usuário é o solicitante (apenas aceitas)

### `getReverseRequest(requesterId, targetId)`
Verifica se já existe uma solicitação no sentido inverso — usado para aceitar automaticamente.

### `acceptRequestById(id)`
Atualiza o status de uma amizade para `"accepted"` pelo ID do registro.

### `createPendingRequest(requesterId, targetId)`
Cria uma solicitação com status `"pending"`. Usa `onConflictDoNothing` para evitar duplicatas.

### `acceptRequestByUsers(requesterId, targetId)`
Aceita uma solicitação filtrando pelos IDs dos dois usuários (direção específica).

### `deleteFriendshipBetweenUsers(userId1, userId2)`
Deleta a amizade usando `OR` para cobrir ambas as direções possíveis.

---

## `userProfile.ts` — `userProfileRepository`

### `getUserByUsername(username)`
Busca um usuário pelo username retornando campos de perfil (id, username, image, description, lastCheckedMessagesAt).

### `getUserById(userId)`
Busca um usuário completo pelo ID — usado antes de updates.

### `getFriendshipBetweenUsers(userId1, userId2)`
Verifica se existe amizade entre dois usuários (em qualquer direção).

### `getAcceptedFriendsCount(userId)`
Conta amizades aceitas onde o usuário é solicitante ou alvo.

### `getTotalMessagesCount(userId)`
Conta o total de mensagens recebidas pelo usuário.

### `getPendingRequestsCount(userId)`
Conta solicitações de amizade pendentes recebidas pelo usuário.

### `getUnreadMessagesCount(userId, lastCheckedAt)`
Conta mensagens recebidas após `lastCheckedAt` — se `lastCheckedAt` for null, conta todas.

### `updateUser(userId, data)`
Atualiza campos do usuário com um payload parcial (`Partial<typeof users.$inferInsert>`).

---

## `userSearch.ts` — `userSearchRepository`

### `searchAuthenticatedUsers(searchQuery, currentUserId)`
Busca usuários por username com `ILIKE` excluindo o próprio usuário. Inclui status de amizade com o usuário atual. Limite de 20 resultados.

### `searchGuestUsers(searchQuery)`
Busca usuários por username com `ILIKE` sem contexto de amizade. Limite de 20 resultados.
