import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: process.env.MAILER_SERVICE,
  host: process.env.MAILER_HOST,
  port: 587,
  secure: false,
  auth: {
    user: process.env.MAILER_USER,
    pass: process.env.MAILER_PASSWORD,
  },
});

export async function sendEmail(to: string, token: string) {
  const options = {
    from: `Diogo do Gugugram<${process.env.MAILER_USER}>`,
    to: to,
    subject: "Gugugram - Cadastrar nova senha",
    text: textTemplate(token),
    html: emailTemplate(token),
  };
  try {
    const info = await transporter.sendMail(options);
    return info;
  } catch (error) {
    throw error;
  }
}

function emailTemplate(token: string) {
  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html dir="ltr" lang="pt-BR">
        <head>
            <meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />
            <meta name="x-apple-disable-message-reformatting" />
        </head>
        <div
            style="
                display: none;
                overflow: hidden;
                line-height: 1px;
                opacity: 0;
                max-height: 0;
                max-width: 0;
            "
        >
            Troque sua senha no Gugugram
            <div></div>
        </div>

        <body
            style="
                background-color: #ffffff;
                font-family: -apple-system, BlinkMacSystemFont, &quot;Segoe UI&quot;,
                    Roboto, Oxygen-Sans, Ubuntu, Cantarell,
                    &quot;Helvetica Neue&quot;, sans-serif;
            "
        >
            <table
                align="center"
                width="100%"
                border="0"
                cellpadding="0"
                cellspacing="0"
                role="presentation"
                style="max-width: 37.5em; margin: 0 auto; padding: 20px 25px 48px"
            >
                <tbody>
                    <tr style="width: 100%">
                        <td>
                            <h1
                                style="
                                    font-size: 28px;
                                    font-weight: bold;
                                    margin-top: 48px;
                                "
                            >
                                Gugugram - Seu link de troca de senha
                            </h1>
                            <table
                                align="center"
                                width="100%"
                                border="0"
                                cellpadding="0"
                                cellspacing="0"
                                role="presentation"
                                style="margin: 24px 0"
                            >
                                <tbody>
                                    <tr>
                                        <td>
                                            <p
                                                style="
                                                    font-size: 16px;
                                                    line-height: 26px;
                                                    margin: 16px 0;
                                                "
                                            >
                                                <a
                                                    href="${process.env.NEXT_PUBLIC_BASE_URL}/nova-senha?token=${token}"
                                                    target="_blank"
                                                    >👉 Clique aqui para definir uma nova senha 👈</a
                                                >
                                            </p>
                                            <p
                                                style="
                                                    font-size: 16px;
                                                    line-height: 26px;
                                                    margin: 16px 0;
                                                "
                                            >
                                                Se você não solicitou troca de
                                                senha, ignore este e-mail
                                            </p>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </td>
                    </tr>
                </tbody>
            </table>
        </body>
    </html>`;
}

function textTemplate(token: string) {
  return `Troque sua senha no Gugugram

Clique aqui para definir uma nova senha: ${process.env.NEXT_PUBLIC_BASE_URL}/nova-senha?token=${token}

Se você não solicitou troca de senha, ignore este e-mail`;
}
