# src/email

Módulo responsável pelo envio de e-mails transacionais via **Nodemailer**.

---

## `email.ts`

### `sendEmail({ to, subject, text, html })`
Envia um e-mail usando o transporter configurado com as variáveis de ambiente do servidor.

Configuração do transporter:
- `MAILER_SERVICE`: serviço de e-mail (ex: `gmail`)
- `MAILER_HOST`: host SMTP
- `MAILER_USER`: usuário de autenticação
- `MAILER_PASSWORD`: senha de autenticação
- Porta: `587` (STARTTLS)

O remetente é fixo: `"Diogo do Gugugram <{MAILER_USER}>"`.

Lança `Error("FAILED_TO_SEND_EMAIL")` em caso de falha no envio.

**Usado por:** `src/auth.ts` no callback `sendResetPassword` do `better-auth`

---

## `templates/resetPassword.ts`

Templates de e-mail para recuperação de senha.

### `resetPasswordEmailTemplate(url, token)`
Retorna o HTML do e-mail de reset de senha.
- Inclui um link clicável para `{url}?token={token}`
- Formatado para leitura em clientes de e-mail

### `resetPasswordTextTemplate(url, token)`
Retorna a versão em texto puro do mesmo e-mail (fallback para clientes sem suporte a HTML).

**Fluxo completo de reset de senha:**
1. Usuário acessa `/esqueci-minha-senha` e submete o e-mail
2. `actions.requestPasswordReset` chama `sendPasswordResetEmail()`
3. `better-auth` gera o token e chama o callback `sendResetPassword`
4. `sendEmail()` é chamado com os templates deste módulo
5. Usuário recebe o e-mail e clica no link → `/nova-senha?token=...`
6. Usuário submete nova senha → `actions.resetPassword` → `performPasswordReset()`
