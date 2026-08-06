# src/observability

Camada de **observabilidade**: logging de erros e rastreamento de eventos de usuário. Dois sistemas distintos: **Sentry** para erros e **PostHog** para analytics.

---

## `logger.ts`

Logger estruturado que integra `console` com **Sentry**.

### `logger.info({ message, context?, metadata? })`
Registra uma mensagem informativa.
- Imprime no console com prefixo `[INFO]`
- Adiciona um breadcrumb no Sentry (nível `info`)

### `logger.warn({ message, context?, metadata? })`
Registra um aviso.
- Imprime no console com prefixo `[WARN]`
- Adiciona um breadcrumb no Sentry (nível `warning`)

### `logger.error({ message, context?, metadata?, error? })`
Registra um erro e envia para o Sentry.
- Imprime no console com prefixo `[ERROR]`
- Cria um scope Sentry com tags de contexto e metadata
- Captura a exceção via `Sentry.captureException()`
- Se `error` não for uma instância de `Error`, cria um novo `Error` com a mensagem

**Caso de uso:**
```ts
import { logger } from '@observability/logger'

logger.error({
  message: 'Falha ao processar upload',
  context: 'imagePost',
  metadata: { userId, postId },
  error: err
})
```

---

## `posthog-server.ts`

Instancia e exporta o cliente **PostHog Node.js** para uso no servidor.

```ts
import { posthogServer } from '@observability/posthog-server'
```

- Configurado com `POSTHOG_KEY` e `POSTHOG_HOST`
- Usado por `tracking-server.ts` e diretamente em `src/pages/api/logout.ts`

---

## `tracking-server.ts`

Abstração sobre o `posthogServer` para rastreamento de eventos no servidor (actions, API routes).

### `identifyUserServer({ distinctId, properties? })`
Associa um `distinctId` (username) a propriedades de usuário no PostHog.

**Chamado em:** login e registro (`src/actions/_authentication.ts`)

### `trackServerEvent({ distinctId, event, properties? })`
Captura um evento no PostHog.

Eventos rastreados na aplicação:
| Evento | Onde é disparado |
|---|---|
| `user_login` | Login e registro |
| `user_logged_out` | Logout |
| `profile_updated` | Atualização de perfil |
| `image_uploaded` | Upload de post |
| `image_post_deleted` | Deleção de post |
| `send_comment` | Novo comentário |
| `delete_comment` | Deleção de comentário |
| `message_sent` | Envio de recado |
| `friend_request_sent` | Solicitação de amizade |
| `friend_request_accepted` | Aceitação de amizade |
| `friendship_removed` | Remoção de amizade |
| `password_reset_requested` | Solicitação de reset de senha |
| `password_reset_completed` | Reset de senha concluído |

### `flushServerEvents()`
Chama `posthogServer.shutdown()` para forçar o envio dos eventos em buffer.

> **Importante:** deve ser chamado ao final de cada invocação serverless. O cliente PostHog é recriado a cada request no ambiente Vercel/serverless.

**Padrão de uso em actions:**
```ts
trackServerEvent({ distinctId: session.username, event: 'image_uploaded' })
await flushServerEvents()
```
