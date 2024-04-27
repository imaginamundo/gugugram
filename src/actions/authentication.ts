"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { AuthError } from "next-auth";
import { ValidationError } from "yup";

import { signIn, signOut } from "@/app/auth";
import { type RegisterInputs, registerSchema } from "@/app/cadastrar/types";
import { type LoginInputs, loginSchema } from "@/app/entrar/types";
import { db } from "@/database/postgres";
import { users } from "@/database/schema";
import { hashPassword } from "@/utils/password";
import { getValidationErrors, type ValidationErrorsObject } from "@/utils/yup";

export async function logoutAction() {
  await signOut({ redirect: false });
  cookies().delete("authjs.session-token");
  redirect("/");
}

export async function loginAction(data: LoginInputs) {
  let errors: ValidationErrorsObject = {};

  await loginSchema.validate(data).catch((err: ValidationError) => {
    errors = getValidationErrors(err);
  });

  if (Object.keys(errors).length) throw new Error("Campos inválidos");

  await signIn("credentials", { redirect: false, ...data }).catch(
    (e: AuthError) => {
      let message = e.message;
      if (e.cause?.err?.message) message = e.cause.err.message;
      throw new Error(message);
    },
  );

  redirect("/");
}

export async function registerAction(data: RegisterInputs) {
  let errors: ValidationErrorsObject = {};

  await registerSchema.validate(data).catch((err: ValidationError) => {
    errors = getValidationErrors(err);
  });

  if (Object.keys(errors).length) throw new Error("Campos inválidos");

  const password = hashPassword(data.password);

  try {
    await db.insert(users).values({
      username: data.username,
      email: data.email,
      password,
    });
  } catch (e) {
    if (e instanceof Error) {
      throw new Error(translateDatabaseError(e.message));
    }
    throw e;
  }
}

const translateDatabaseError = (message: string) => {
  switch (message) {
    case 'duplicate key value violates unique constraint "gugugram_user_username_unique"':
      return "Nome de usuário já cadastrado";
    case 'duplicate key value violates unique constraint "gugugram_user_email_unique"':
      return "E-mail já cadastrado";
    default:
      message;
  }
};
