# src/types

Definições de tipos TypeScript globais da aplicação.

---

## `errors.ts`

Constantes de códigos de erro organizadas por domínio. Usadas para comunicação tipada entre services e actions, evitando strings mágicas.

### `ImagePostErrors`
| Código | Significado |
|---|---|
| `FILE_TOO_LARGE` | Arquivo maior que 60KB |
| `INVALID_IMAGE_FILE` | Arquivo corrompido ou não é imagem |
| `INVALID_IMAGE_DIMENSIONS` | Dimensões não permitidas (deve ser quadrada: 5, 10, 15, 30 ou 60px) |
| `UPLOAD_FAILED` | Falha no upload para o UploadThing |
| `DB_INSERT_FAILED` | Falha ao inserir no banco após upload |
| `POST_NOT_FOUND_OR_FORBIDDEN` | Post não existe ou não pertence ao usuário |
| `INVALID_IMAGE_URL` | URL da imagem inválida (não tem key) |
| `COMMENT_INVALID` | Comentário vazio após sanitização |
| `POST_NOT_FOUND` | Post não encontrado ao comentar |
| `COMMENT_NOT_FOUND` | Comentário não encontrado ao deletar |
| `COMMENT_NOT_AUTHORIZED` | Usuário não é autor do comentário nem dono do post |

### `MessageErrors`
| Código | Significado |
|---|---|
| `MESSAGE_NOT_FOUND` | Mensagem não encontrada |
| `FORBIDDEN` | Usuário não é autor nem destinatário |

### `AuthErrors`
| Código | Significado |
|---|---|
| `USER_NOT_FOUND` | Usuário não encontrado |
| `RESET_REQUEST_FAILED` | Falha ao solicitar reset de senha |
| `RESET_FAILED` | Falha ao efetuar reset de senha |

### `ProfileErrors`
| Código | Significado |
|---|---|
| `USER_NOT_FOUND` | Usuário não encontrado antes do update |
| `IMAGE_UPLOAD_FAILED` | Falha no upload da nova foto de perfil |
| `IMAGE_PROCESSING_FAILED` | Erro ao processar o base64 da imagem |
| `UNIQUE_CONSTRAINT_VIOLATION` | Username ou e-mail já em uso (código PG `23505`) |
| `NO_IMAGE_TO_REMOVE` | Usuário não tem foto de perfil para remover |
| `DB_UPDATE_FAILED` | Falha genérica no update do banco |

**Padrão de uso:**
```ts
// No service:
throw new Error(ImagePostErrors.FILE_TOO_LARGE)

// Na action:
case ImagePostErrors.FILE_TOO_LARGE:
  message = "Imagem muito grande. O tamanho máximo é 60KB."
```

---

## `tracking.ts`

Tipo `AppTrackingEvent` — union type com todos os nomes de eventos válidos para o PostHog.

Garante que apenas eventos definidos possam ser rastreados, evitando typos em nomes de eventos.

**Usado por:** `src/observability/tracking-server.ts` e `src/utils/tracking.ts`
