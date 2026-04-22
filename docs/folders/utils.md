# src/utils

Funções utilitárias puras e helpers reutilizáveis. Sem dependências de framework — podem ser usadas em qualquer camada.

---

## `action-guard.ts`

### `withAuth(handler)`
Higher-order function que protege uma action exigindo autenticação.

```ts
export const minhaAction = defineAction({
  handler: withAuth(async (input, context, session) => {
    // session é garantidamente não-nulo aqui
  })
})
```

- Verifica `context.locals.user`
- Se não autenticado: retorna `{ success: false, error: "Não autenticado." }` imediatamente
- Se autenticado: chama o handler passando a sessão como terceiro argumento

**Usado por:** todas as actions que requerem autenticação em `src/actions/`

---

## `cookie.ts`

### `applySetCookie(headers, cookies)`
Transfere os cookies `Set-Cookie` dos headers de resposta do `better-auth` para o contexto de cookies do Astro.

- Necessário porque o `better-auth` retorna cookies nos headers HTTP, mas o Astro gerencia cookies via `context.cookies`
- Itera sobre todos os valores `set-cookie` e os aplica individualmente

**Usado por:** `src/actions/_authentication.ts` após login e registro

---

## `date.ts`

Utilitários de formatação de datas.

### `formatDate(date)`
Formata uma `Date` para string legível em português brasileiro.

**Exemplo:** `new Date('2024-04-15')` → `"15 de abril de 2024"`

### `formatRelativeDate(date)`
Retorna uma string relativa ao momento atual.

**Exemplos:** `"há 5 minutos"`, `"há 2 horas"`, `"há 3 dias"`

**Usado por:** componentes que exibem timestamps de posts, comentários e mensagens

---

## `draggableDialog.ts`

### `makeDraggable(element)`
Torna um elemento HTML arrastável via mouse (drag-and-drop).

- Implementa listeners de `mousedown`, `mousemove` e `mouseup`
- Calcula offset para manter a posição relativa do clique durante o arraste

**Usado por:** modais Svelte para comportamento de janela arrastável (estética Windows 98)

---

## `emoji.ts`

### `getEmojiList()`
Retorna a lista de emojis disponíveis na pasta `public/emojis/`.

### `getEmojiUrl(name)`
Retorna a URL pública de um emoji pelo nome do arquivo.

**Exemplo:** `getEmojiUrl('happy')` → `"/emojis/happy.png"`

**Usado por:** componentes de mensagem e comentário para seleção de emojis

---

## `image.ts`

### `fileToBase64(file)`
Converte um objeto `File` para string base64 com prefixo data URL.

**Exemplo:** `"data:image/png;base64,iVBORw0KGgo..."`

**Usado por:** `src/components/_ui/InputImage.svelte` para preview e envio da imagem de perfil

---

## `password.ts`

### `hashPassword(password)`
Gera um hash seguro da senha usando `crypto.scrypt` (Node.js nativo).

- Gera um salt aleatório de 16 bytes
- Retorna `"salt:hash"` como string

### `validatePassword(hash, password)`
Verifica se uma senha corresponde ao hash armazenado.

- Extrai o salt do hash armazenado
- Recalcula o hash e compara com timing-safe (`crypto.timingSafeEqual`)

**Usado por:** `src/auth.ts` na configuração do `better-auth` (callbacks `hash` e `verify`)

---

## `rate-limit.ts`

### `checkRateLimit(lastCreatedAt, limitMs, message)`
Verifica se o tempo mínimo entre ações foi respeitado.

- Se `lastCreatedAt` for null/undefined: passa sem restrição
- Calcula `Date.now() - lastCreatedAt.getTime()`
- Se menor que `limitMs`: lança `Error` com mensagem + tempo restante em segundos

**Exemplo de uso:**
```ts
checkRateLimit(lastPost?.createdAt, 5000, "Aguarde mais")
// lança: "Aguarde mais 3 segundo(s)."
```

**Usado por:** `src/services/imagePost.ts` e `src/services/message.ts`

---

## `request.ts`

Helpers para manipulação de objetos `Request` e `Headers` do Astro/Web API.

---

## `tracking.ts`

Funções de tracking para o **lado cliente** (browser).

### `initTracking()`
Inicializa o PostHog no cliente com a chave e host configurados nas variáveis de ambiente públicas.

### `identifyUser(username)`
Associa o usuário atual ao PostHog para rastreamento de eventos.

**Usado por:** `src/components/_layout/Main.astro` via script inline no `<head>`

---

## `user.ts`

### `parseUser(rawUser)`
Normaliza um objeto de usuário vindo do banco para o formato padrão da aplicação.

- Garante que campos opcionais tenham valores padrão
- Retorna o tipo `User` usado em toda a UI

### Tipos exportados
- `User` — formato padrão de usuário na UI
- `FriendsType` — `{ friends: User[], friendRequests: User[] }`
- `FriendshipContext` — `{ status: 'pending' | 'accepted', type: 'target' | 'request' }`

---

## `validation.ts`

### `parseSchema(input, schema)`
Wrapper sobre `schema.safeParse()` do Zod que normaliza o resultado.

- Aceita `FormData` ou objetos planos
- Retorna `{ success, fields, fieldErrors }` com tipagem correta
- `fields`: dados parseados (ou input original em caso de erro)
- `fieldErrors`: erros por campo no formato `{ campo: "mensagem" }`

**Usado por:** todas as actions em `src/actions/`
