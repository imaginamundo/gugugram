"use server";

import { ValidationError } from "yup";

import { signIn } from "@/app/auth";
import { type RegisterInputs, registerSchema } from "@/app/cadastrar/types";
import { type LoginInputs, loginSchema } from "@/app/entrar/types";
import { db } from "@/database/postgres";
import { users } from "@/database/schema";
import { hashPassword } from "@/utils/password";
import { getValidationErrors, type ValidationErrorsObject } from "@/utils/yup";

export async function loginAction(data: LoginInputs) {
  let errors: ValidationErrorsObject = {};

  await loginSchema.validate(data).catch((err: ValidationError) => {
    errors = getValidationErrors(err);
  });

  if (Object.keys(errors).length) throw new Error("Campos inválidos");

  const formData = new FormData();
  formData.append("email", data.email);
  formData.append("password", data.password);

  return await signIn("credentials", formData).catch((e) => {
    throw e;
  });
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
