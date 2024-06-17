"use server";

import crypto from "node:crypto";

import { kv } from "@vercel/kv";
import { eq } from "drizzle-orm";
import { sanitize } from "isomorphic-dompurify";
import { cookies } from "next/headers";
import type { AuthError } from "next-auth";
import { ValidationError } from "yup";

import { signIn, signOut } from "@/app/auth";
import { type RegisterInputs, registerSchema } from "@/app/cadastrar/types";
import { type LoginInputs, loginSchema } from "@/app/entrar/types";
import { type ForgotPasswordInputs } from "@/app/esqueci-minha-senha/types";
import {
  type NewPasswordInputs,
  newPasswordSchema,
} from "@/app/nova-senha/types";
import { db } from "@/database/postgres";
import { users } from "@/database/schema";
import { sendEmail } from "@/utils/mailer";
import { hashPassword } from "@/utils/password";
import { getValidationErrors, type ValidationErrorsObject } from "@/utils/yup";

export async function logoutAction() {
  await signOut({ redirect: false });
  cookies().delete("authjs.session-token");
}

export async function loginAction(data: LoginInputs) {
  let errors: ValidationErrorsObject = {};

  await loginSchema.validate(data).catch((err: ValidationError) => {
    errors = getValidationErrors(err);
  });

  if (Object.keys(errors).length) {
    return { message: "Campos inválidos", errors };
  }

  const sanitizedIdentity = sanitize(data.identity).toLowerCase();
  const sanitizedPassword = sanitize(data.password).toLowerCase();

  return await signIn("credentials", {
    redirect: false,
    identity: sanitizedIdentity,
    password: sanitizedPassword,
  }).catch((e: AuthError) => {
    let message = e.message;

    if (e.cause?.err?.message) message = e.cause.err.message;
    return { message };
  });
}

export async function registerAction(data: RegisterInputs) {
  let errors: ValidationErrorsObject = {};

  await registerSchema.validate(data).catch((err: ValidationError) => {
    errors = getValidationErrors(err);
  });

  if (Object.keys(errors).length)
    return { message: "Campos inválidos", errors };

  const sanitizedUsername = sanitize(data.username).toLowerCase();
  const sanitizedEmail = sanitize(data.email).toLowerCase();
  const sanitizedPassword = sanitize(data.password).toLowerCase();

  const password = hashPassword(sanitizedPassword);

  try {
    await db.insert(users).values({
      username: sanitizedUsername,
      email: sanitizedEmail,
      password,
    });
  } catch (e) {
    if (e instanceof Error) {
      return { message: translateDatabaseError(e.message) };
    }
    throw e;
  }
}

export async function forgotPasswordAction(data: ForgotPasswordInputs) {
  const id = crypto.randomUUID();
  const sanitizedEmail = sanitize(data.email).toLowerCase();

  const user = await db.query.users.findFirst({
    where: (user, { eq }) => eq(user.email, sanitizedEmail),
  });

  console.log(user);

  if (!user) return { message: "E-mail não cadastrado" };

  try {
    await kv.set(id, sanitizedEmail, { ex: 60 * 30 }); // 30 min
  } catch (err) {
    return { message: "Algo de errado não deu certo" };
  }

  try {
    await sendEmail(sanitizedEmail, id);
  } catch (e) {
    console.log(e);
    return { message: "Falha ao enviar e-mail" };
  }
}

export async function newPasswordInformation(token: string) {
  if (!token) return { message: "Token inválido" };

  let data = "";

  try {
    let redisData = await kv.get<string>(token);
    if (redisData) data = redisData;
  } catch (e) {
    return { message: "Algo de errado não deu certo" };
  }

  if (!data) return { message: "Token inválido" };
}

export async function newPasswordAction(
  data: NewPasswordInputs,
  token: string,
) {
  let errors: ValidationErrorsObject = {};
  let email = "";

  await newPasswordSchema.validate(data).catch((err: ValidationError) => {
    errors = getValidationErrors(err);
  });

  if (Object.keys(errors).length) {
    return { message: "Campos inválidos", errors };
  }

  try {
    let redisData = await kv.get<string>(token);
    if (redisData) email = redisData;
  } catch (e) {
    return { message: "Algo de errado não deu certo" };
  }

  if (!email) return { message: "Tempo expirado" };

  const sanitizedPassword = sanitize(data.newPassword).toLowerCase();
  const password = hashPassword(sanitizedPassword);

  await db
    .update(users)
    .set({
      password,
    })
    .where(eq(users.email, email));

  await kv.del(token);
}

const translateDatabaseError = (message: string) => {
  switch (message) {
    case 'duplicate key value violates unique constraint "gugugram_users_username_unique"':
      return "Nome de usuário já cadastrado";
    case 'duplicate key value violates unique constraint "gugugram_users_email_unique"':
      return "E-mail já cadastrado";
    default:
      message;
  }
};
