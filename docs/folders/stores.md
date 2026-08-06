# src/stores

Gerenciamento de estado client-side usando **Svelte 5 Runes** (`$state`).

---

## `imagePostModalStore.svelte.ts`

Store global que controla qual post está sendo exibido no modal de detalhes (`ImagePostModal`).

### Estado
```ts
let post = $state<PostType | undefined>()
```

### API

#### `imageModalStore.post` (getter)
Retorna o post atualmente selecionado, ou `undefined` se o modal estiver fechado.

#### `imageModalStore.post = value` (setter)
Define o post a ser exibido e abre o modal.

**Caso de uso:** componente `ImagePost.svelte` ao clicar em um post:
```ts
import { imageModalStore } from '@stores/imagePostModalStore.svelte'

imageModalStore.post = post // abre o modal com este post
```

#### `imageModalStore.clear()`
Limpa o post selecionado, efetivamente fechando o modal.

**Caso de uso:** componente `ImagePostModal.svelte` ao fechar:
```ts
imageModalStore.clear()
```

### Fluxo completo
1. Usuário clica em um `ImagePost` no grid
2. `ImagePost.svelte` chama `imageModalStore.post = post`
3. `ImagePostModal.svelte` (renderizado no layout global) reage à mudança de estado
4. Modal abre exibindo detalhes do post
5. Usuário fecha o modal → `imageModalStore.clear()` → modal fecha
