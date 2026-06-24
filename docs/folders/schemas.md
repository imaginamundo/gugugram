# src/schemas

Definições de schema usadas em duas camadas distintas: banco de dados (Drizzle) e validação de formulários (Zod).

---

## `database.ts`

Schema completo do banco de dados PostgreSQL usando **Drizzle ORM**.

Todas as tabelas são prefixadas com `gugugram_` via `pgTableCreator`.

### Tabelas

#### `users` (`gugugram_users`)
Usuários da plataforma.

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | text PK | ID gerado pelo better-auth |
| `username` | text UNIQUE | Username em lowercase (usado em URLs) |
| `displayUsername` | text | Username com capitalização original |
| `email` | text UNIQUE | E-mail do usuário |
| `emailVerified` | boolean | Verificação de e-mail (não obrigatória) |
| `image` | text | URL da foto de perfil (UploadThing) |
| `description` | text | Bio do perfil |
| `lastCheckedMessagesAt` | timestamp | Controle de mensagens não lidas |
| `createdAt` / `updatedAt` | timestamp | Timestamps padrão |

#### `imagePosts` (`gugugram_images_posts`)
Posts de imagem dos usuários.

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | text PK | UUID gerado com `crypto.randomUUID()` |
| `image` | text | URL da imagem no UploadThing |
| `description` | text | Descrição opcional (sanitizada) |
| `authorId` | text FK → users | Cascade delete |
| `createdAt` | timestamp | Data de criação |

#### `messages` (`gugugram_messages`)
Recados entre usuários.

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | text PK | UUID |
| `body` | text | Conteúdo da mensagem (sanitizado) |
| `authorId` | text FK → users | Quem enviou |
| `receiverId` | text FK → users | Quem recebeu |
| `createdAt` | timestamp | Data de envio |

#### `userFriends` (`gugugram_user_friends`)
Relacionamentos de amizade.

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | text PK | UUID |
| `requestUserId` | text FK → users | Quem enviou a solicitação |
| `targetUserId` | text FK → users | Quem recebeu a solicitação |
| `status` | enum | `"pending"` ou `"accepted"` |
| `createdAt` / `updatedAt` | timestamp | Timestamps |

Constraints:
- `uniqueIndex` em `(requestUserId, targetUserId)` — evita solicitações duplicadas
- `check` `no_self_friend` — impede amizade consigo mesmo no nível do banco

#### `imagePostComments` (`gugugram_image_post_comments`)
Comentários em posts de imagem.

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | text PK | UUID |
| `imageId` | text FK → imagePosts | Cascade delete |
| `authorId` | text FK → users | Cascade delete |
| `body` | text | Conteúdo do comentário |
| `createdAt` | timestamp | Data do comentário |

#### Tabelas do `better-auth`
Gerenciadas automaticamente pela biblioteca:
- `sessions` (`gugugram_sessions`) — sessões ativas
- `accounts` (`gugugram_accounts`) — contas com credenciais (senha hasheada)
- `verifications` (`gugugram_verifications`) — tokens de verificação/reset

### Relations (Drizzle)
Definidas para habilitar queries relacionais com `db.query.*`:
- `usersRelations` → imagePosts, requestedFriends, targetedFriends, messagesSent, messagesReceived, imagePostComments
- `userFriendsRelations` → requestUser, targetUser
- `imagePostsRelations` → author, comments
- `imagePostCommentsRelations` → post, author
- `messagesUserAuthorRelations` → author, receiver

---

## `authentication.ts`

Schemas Zod para validação dos formulários de autenticação.

### `LoginSchema`
Valida o formulário de login:
- `identity`: string (username ou e-mail)
- `password`: string

### `RegisterSchema`
Valida o formulário de cadastro:
- `username`: string
- `email`: string com validação de formato
- `password`: string
