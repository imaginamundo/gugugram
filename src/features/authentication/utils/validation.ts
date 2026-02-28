import { z } from "astro:schema";
import { parseSchema, formDataToObject } from "@utils/validation";
import {
  LoginSchema,
  RegisterSchema,
} from "@features/authentication/schemas/authentication";

export function validateLogin(input: FormData) {
  const inputObject = formDataToObject<z.infer<typeof LoginSchema>>(input);
  return parseSchema(inputObject, LoginSchema);
}

export function validateRegister(input: FormData) {
  const inputObject = formDataToObject<z.infer<typeof RegisterSchema>>(input);
  return parseSchema(inputObject, RegisterSchema);
}
