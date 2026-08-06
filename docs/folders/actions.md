# src/actions

Camada de **Server Actions** do Astro. Cada arquivo define ações que são chamadas diretamente de formulários HTML via `action={actions.nomeDaAcao}`. Toda validação de schema, autenticação e chamada de serviço acontece aqui.

---

## `index.ts`

Ponto de entrada que agrega e exporta todas as actions sob o objeto `server`.

```ts
import { server } from 'astro:actions'
// server.login, server.register, server.uploadImagePost, etc.
```

---

## `_authentication.ts`

### `login`
Autentica um usuário existente via e-mail ou nome de usuário + senha.

- Valida o input com `LoginSchema`
- Chama `authenticateUser()` do service de auth
- Aplica os cookies de sessão retornados pelo `better-auth`
- Dispara eventos de tracking no PostHog (`user_login`, `identifyUser`)
- Retorna `{ success: true, username }` ou `{ success: false, error, fieldErrors }`

**Caso de uso:** Formulário em `src/pages/entrar.astro`

### `register`
Cria uma nova conta de usuário.

- Valida com `RegisterSchema`
- Chama `registerNewUser()` do service de auth
- Aplica cookies de sessão
- Dispara tracking de novo usuário
- Retorna `{ success: true, username }` ou erro com detalhes de campo

**Caso de uso:** Formulário em `src/pages/cadastrar.astro`

---

## `_passwordRecovery.ts`

### `requestPasswordReset`
Solicita o envio de e-mail de recuperação de senha.

- Valida o e-mail com Zod
- Chama `sendPasswordResetEmail()` que usa `better-auth` + `nodemailer`
- Redireciona para `/nova-senha` após o clique no link do e-mail
- Retorna mensagem genérica (não revela se o e-mail existe)

**Caso de uso:** Formulário em `src/pages/esqueci-minha-senha.astro`

### `resetPassword`
Efetiva a troca de senha usando o token recebido por e-mail.

- Valida `newPassword` (mín. 8 chars) e `token`
- Chama `performPasswordReset()` do service de auth
- Redireciona para `/entrar` em caso de sucesso

**Caso de uso:** Formulário em `src/pages/nova-senha.astro`

---

## `_profile.ts`

### `updateProfile`
Atualiza dados do perfil do usuário autenticado.

- Protegido por `withAuth()` — rejeita se não houver sessão
- Valida `username`, `email`, `description`, `profileImage` (base64 opcional)
- Chama `updateProfileData()` que faz upload da imagem no UploadThing se fornecida
- Trata erros de constraint única (username/email duplicado)
- Dispara evento `profile_updated` no PostHog

**Caso de uso:** Formulário em `src/pages/editar-perfil.astro`

### `removeProfileImage`
Remove a foto de perfil do usuário autenticado.

- Protegido por `withAuth()`
- Chama `removeProfileImageFromUser()` que deleta do UploadThing e limpa o campo no banco

**Caso de uso:** Componente `src/components/profile/RemoveProfilePicture/RemoveProfilePicture.svelte`

---

## `_imagePost.ts`

### `uploadImagePost`
Faz upload de uma imagem como post.

- Protegido por `withAuth()`
- Valida que o arquivo é uma `File` e a descrição tem no máximo 500 chars
- Chama `processAndUploadImagePost()` que verifica: tamanho (máx 60KB), dimensões quadradas (5, 10, 15, 30 ou 60px), rate limit de 5s
- Dispara evento `image_uploaded` no PostHog

**Caso de uso:** Modal `src/components/post/UploadImagePostModal/UploadImagePostModal.svelte`

### `deleteImagePost`
Deleta um post de imagem do usuário autenticado.

- Protegido por `withAuth()`
- Valida `id` e `imageUrl`
- Chama `removeImagePost()` que verifica ownership antes de deletar do banco e do UploadThing

**Caso de uso:** Componente `src/components/post/DeleteImagePost/DeleteImagePost.svelte`

### `sendImagePostComment`
Adiciona um comentário a um post de imagem.

- Protegido por `withAuth()`
- Valida `imageId` e `body` (1–500 chars)
- Aplica rate limit de 5s e sanitização HTML
- Verifica se o post existe antes de inserir

**Caso de uso:** Componente `src/components/post/ImagePostDetails/ImagePostDetails.svelte`

### `deleteImagePostComment`
Remove um comentário de um post.

- Protegido por `withAuth()`
- Verifica se o usuário é autor do comentário **ou** dono do post antes de deletar

**Caso de uso:** Componente `src/components/post/ImagePostDetails/ImagePostDetails.svelte`

---

## `_message.ts`

### `sendMessage`
Envia um recado para outro usuário.

- Protegido por `withAuth()`
- Valida `receiverId` e `body` (1–1000 chars)
- Impede envio para si mesmo
- Aplica rate limit de 5s e sanitização HTML
- Dispara evento `message_sent` no PostHog

**Caso de uso:** Componente `src/components/profile/Messages/Messages.astro`

### `removeMessage`
Remove um recado.

- Protegido por `withAuth()`
- Verifica se o usuário é autor **ou** destinatário da mensagem

**Caso de uso:** Componente `src/components/profile/Messages/Messages.astro`

### `markMessagesAsRead`
Marca todas as mensagens como lidas, atualizando `lastCheckedMessagesAt`.

- Protegido por `withAuth()`
- Aceita JSON (não form)

---

## `_friendshipRelation.ts`

### `sendFriendRequest`
Envia ou aceita automaticamente uma solicitação de amizade.

- Protegido por `withAuth()`
- Se já existe uma solicitação reversa pendente, aceita automaticamente
- Caso contrário, cria uma solicitação `pending`
- Retorna o status resultante: `"pending"` ou `"accepted"`

**Caso de uso:** Componente `src/components/_shared/FriendshipButtons/FriendshipButtons.svelte`

### `acceptFriendRequest`
Aceita uma solicitação de amizade pendente.

- Protegido por `withAuth()`
- Chama `acceptPendingFriendRequest()` no service

**Caso de uso:** Componente `src/components/_shared/FriendshipButtons/FriendshipButtons.svelte`

### `removeFriendship`
Remove uma amizade existente (em qualquer direção).

- Protegido por `withAuth()`
- Deleta o registro independente de quem fez a solicitação original

**Caso de uso:** Componente `src/components/_shared/FriendshipButtons/FriendshipButtons.svelte`
