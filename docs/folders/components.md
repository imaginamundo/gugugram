# src/components

Componentes de UI organizados por domínio. A aplicação usa **Astro** para componentes estáticos/SSR e **Svelte 5** para componentes interativos (client-side).

**Convenção:** componentes Astro (`.astro`) são renderizados no servidor. Componentes Svelte (`.svelte`) são hidratados no cliente com diretivas `client:load` ou `client:idle`.

---

## `_layout/`

Componentes estruturais que formam o shell da aplicação.

### `Main.astro`
Layout raiz usado por todas as páginas. Responsável por:
- Tags `<head>` completas (meta SEO, Open Graph, Twitter Card, favicons, manifest)
- Carregamento da fonte MS Sans Serif (woff2 com preload)
- Estrutura visual estilo Windows 98 (`.window`, `.title-bar`, `.window-body`)
- Inicialização do PostHog via script inline
- Renderização do `<Header>` e do `<ImagePostModal>` global
- Slot para conteúdo das páginas

Props: `title?`, `description?`, `robots?`, `shareImage?`

### `Header.astro`
Barra de navegação superior com:
- Link para página inicial
- Botão de upload de imagem (abre `UploadImagePostModal`)
- Campo de busca por usuário (GET `/buscar?q=`)
- Área de usuário: exibe username + logout (autenticado) ou links entrar/cadastrar (guest)

### `LogoutButton.svelte`
Botão que faz `POST /api/logout` e redireciona para `/`.

---

## `_ui/`

Biblioteca de componentes de UI primitivos com estética Windows 98.

### `Button.svelte`
Botão padrão da aplicação. Aceita todas as props nativas de `<button>` via `$$restProps`.

### `Input.svelte`
Campo de texto. Aceita todas as props nativas de `<input>`.

### `Textarea.svelte`
Área de texto. Aceita `value` e props nativas de `<textarea>`.

### `Select.svelte`
Dropdown de seleção. Aceita `options` e props nativas de `<select>`.

### `Checkbox.svelte`
Checkbox customizado com ícone SVG de checkmark.

### `Radio.svelte`
Radio button customizado com ícone SVG.

### `Modal.svelte`
Container de modal reutilizável com:
- Overlay de fundo
- Janela arrastável via `makeDraggable()` de `src/utils/draggableDialog.ts`
- Botão de fechar (X)
- Slot para conteúdo

### `InputImage.svelte`
Input especializado para upload de imagem de perfil:
- Exibe preview da imagem selecionada
- Converte o arquivo para base64 via `fileToBase64()`
- Armazena o base64 em um `<input type="hidden">` para envio no formulário

### `types.ts`
Tipos TypeScript compartilhados entre os componentes de UI.

---

## `_shared/`

Componentes reutilizáveis entre múltiplos domínios.

### `FriendshipButtons/FriendshipButtons.svelte`
Exibe os botões de ação de amizade baseado no status atual:
- Sem amizade: botão "Adicionar amigo" → chama `actions.sendFriendRequest`
- Pendente (enviado): botão desabilitado "Solicitação enviada"
- Pendente (recebido): botão "Aceitar solicitação" → chama `actions.acceptFriendRequest`
- Aceito: botão "Remover amigo" → chama `actions.removeFriendship`

Props: `targetUserId`, `initialStatus`, `initialType`

### `UsersList/UsersList.astro`
Lista de usuários com avatar, username e botões de amizade.

Props: `users` (array com dados de usuário e status de amizade), `additionalParameter?`

---

## `post/`

Componentes relacionados a posts de imagem.

### `ImagePostList/ImagePostList.astro`
Grid de posts de imagem. Renderiza uma lista de `<ImagePost>`.

Props: `posts: PostType[]`

### `ImagePost/ImagePost.svelte`
Card individual de post. Ao clicar, abre o `ImagePostModal` via `imageModalStore`.

Props: `post: PostType`

### `ImagePostModal/ImagePostModal.svelte`
Modal global (renderizado no layout) que exibe detalhes de um post quando `imageModalStore.post` é definido.
- Mostra a imagem, descrição, autor e comentários
- Fecha ao clicar fora ou no X

Props: `session`

### `ImagePostDetails/ImagePostDetails.svelte`
Versão de página completa dos detalhes de um post (usado em `[username]/[postId].astro`).
- Exibe imagem, descrição, autor, data
- Lista comentários com opção de deletar (para autor do comentário ou dono do post)
- Formulário para adicionar comentário (usuários autenticados)

Props: `post: PostWithCommentsType`, `session`

### `UploadImagePostModal/UploadImagePostModal.svelte`
Modal de upload de nova imagem:
- Formulário com `InputImage` e campo de descrição
- Submete para `actions.uploadImagePost`
- Exibe erros de validação (tamanho, dimensões, rate limit)

Props: `session`

### `DeleteImagePost/DeleteImagePost.svelte`
Botão/formulário de deleção de post. Visível apenas para o autor do post.

Props: `post`

---

## `profile/`

Componentes da página de perfil de usuário.

### `ProfileHeader/ProfileHeader.astro`
Cabeçalho do perfil com:
- Avatar do usuário (foto de perfil ou emoji padrão)
- Username e descrição
- Botões de amizade (`FriendshipButtons`) para visitantes autenticados
- Link para editar perfil (para o próprio usuário)

Props: `user` (com dados de perfil e status de amizade)

### `ProfileTabs/ProfileTabs.svelte`
Abas de navegação do perfil: Fotos, Recados, Amigos.
- Exibe contadores em cada aba (total de recados, amigos)
- Destaca notificações de mensagens não lidas e solicitações pendentes
- Slot para conteúdo da aba ativa

Props: `selectedTab`, `username`, `messagesCount`, `friendsCount`, `pendingFriendRequest`, `unreadMessagesCount`

### `Messages/Messages.astro`
Lista de recados recebidos com formulário para enviar novo recado.
- Exibe cada mensagem com avatar do autor, texto e data relativa
- Botão de deletar mensagem (para autor ou destinatário)
- Formulário de envio visível apenas para usuários autenticados (exceto o próprio dono)

Props: `user`, `messages`

### `FriendsList/FriendsList.astro`
Lista de amigos aceitos e solicitações pendentes recebidas.
- Usa `UsersList` para renderizar cada grupo

Props: `friends`, `friendRequests`

### `RemoveProfilePicture/RemoveProfilePicture.svelte`
Botão que submete `actions.removeProfileImage` para remover a foto de perfil atual.
Visível apenas quando o usuário tem uma foto que não é um emoji padrão.

Props: `user`
