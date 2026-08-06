# src/infra

Camada de **infraestrutura**. Inicializa e exporta os clientes de serviços externos. Nenhuma regra de negócio aqui — apenas configuração e instanciação.

---

## `database.ts`

Cria e exporta a instância do banco de dados usando **Drizzle ORM** com o driver serverless do **Neon (PostgreSQL)**.

```ts
import { db } from '@infra/database'
```

- Usa `neon()` do `@neondatabase/serverless` como cliente HTTP
- Passa o schema completo para habilitar queries relacionais (`db.query.*`)
- A URL de conexão vem da variável de ambiente `POSTGRES_URL` (validada pelo Astro env)

**Usado por:** todos os repositórios em `src/repositories/`

---

## `uploadthing.ts`

Instancia e exporta o cliente `UTApi` do **UploadThing**.

```ts
import { utapi } from '@infra/uploadthing'
```

- Autenticado via `UPLOADTHING_TOKEN`
- Expõe métodos como `uploadFiles()` e `deleteFiles()`

**Usado por:** `src/infra/storage.ts`

---

## `storage.ts`

Abstração sobre o `utapi` que expõe uma interface simples de storage.

```ts
import { storage } from '@infra/storage'

await storage.upload(file)   // retorna { data: { ufsUrl } }
await storage.delete(key)    // deleta pelo key (última parte da URL)
```

- `upload(file: File)` → chama `utapi.uploadFiles(file)`
- `delete(key: string)` → chama `utapi.deleteFiles(key)`

**Usado por:** `src/services/imagePost.ts` e `src/services/user/profile.ts`

> O `key` de uma imagem é extraído da URL com `.split('/').pop()`. Exemplo:
> `https://ufs.io/f/abc123xyz` → key = `abc123xyz`
