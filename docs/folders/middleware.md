# src/middleware

Middlewares do Astro executados em sequência a cada requisição, definidos em `index.ts` via `sequence()`.

**Ordem de execução:** `checkOrigin` → `authentication` → `protectedRoutes`

---

## `index.ts`

Ponto de entrada que compõe os middlewares com `sequence()` do Astro.

```ts
export const onRequest = sequence(checkOrigin, authentication, protectedRoutes)
```

---

## `_checkOrigin.ts`

Proteção contra **CSRF** para requisições não-GET/HEAD.

- Verifica o header `Origin` em todas as requisições `POST`, `PUT`, `DELETE`, etc.
- Origens permitidas: `https://www.gugugram.com`, `https://gugugram.com`
- Em desenvolvimento (`import.meta.env.DEV`): também permite `http://localhost:4321`
- Retorna `403 Forbidden` se a origem não for permitida ou estiver ausente

> Nota: `checkOrigin: false` está no `astro.config.js` para desabilitar a verificação nativa do Astro, pois este middleware faz o controle manualmente.

---

## `_authentication.ts`

Popula `context.locals` com os dados da sessão atual.

- Chama `auth.api.getSession()` passando os headers da requisição
- Se a sessão for válida: define `context.locals.user` e `context.locals.session`
- Se não houver sessão: define ambos como `null`

Após este middleware, qualquer página ou action pode acessar:
```ts
const session = Astro.locals.user   // em páginas .astro
const session = context.locals.user // em actions e API routes
```

---

## `_protectedRoutes.ts`

Redireciona usuários não autenticados que tentam acessar rotas protegidas.

- Rotas protegidas: `["/editar-perfil"]`
- Se o usuário não estiver autenticado e tentar acessar uma rota protegida, redireciona para `/entrar`

**Caso de uso:** Impede acesso direto à URL `/editar-perfil` sem estar logado.
