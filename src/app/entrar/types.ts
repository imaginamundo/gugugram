import { ValidationError } from "yup";

import yup from "@/utils/yup";

const requiredMessage = "Campo obrigatório";
const fieldLimitMessage = (n: number) =>
  `Campo pode ter até ${n.toString()} caracteres`;
const invalidEmailMessage = "E-mail invalido";
const invalidUsernameMessage =
  "Nome de usuário não pode caracteres especiais ou espaços";

const usernameSchema = yup
  .string()
  .max(14, fieldLimitMessage(14))
  .matches(/^[a-zA-Z0-9]+$/, {
    message: invalidUsernameMessage,
    excludeEmptyString: true,
  });

const emailSchema = yup.string().email(invalidEmailMessage);

export const loginSchema = yup.object({
  identity: yup
    .string()
    .required(requiredMessage)
    .test("is-email-or-username", function (value) {
      if (value.includes("@")) {
        try {
          emailSchema.validateSync(value);
          return true;
        } catch (e) {
          if (e instanceof ValidationError) {
            return this.createError({
              message: e.message,
              path: "identity",
            });
          }
        }
      }
      try {
        usernameSchema.validateSync(value);
        return true;
      } catch (e) {
        if (e instanceof ValidationError) {
          return this.createError({
            message: e.message,
            path: "identity",
          });
        }
      }
    }),
  password: yup
    .string()
    .max(40, fieldLimitMessage(40))
    .required(requiredMessage),
});

export type LoginInputs = yup.InferType<typeof loginSchema>;
