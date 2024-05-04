import yup from "@/utils/yup";

const requiredMessage = "Campo obrigatório";
const fieldLimitMessage = (n: number) =>
  `Campo pode ter até ${n.toString()} caracteres`;
const invalidEmailMessage = "E-mail invalido";

export const registerSchema = yup.object({
  username: yup
    .string()
    .max(14, fieldLimitMessage(14))
    .matches(/^[a-zA-Z0-9]+$/, {
      message: "Não pode caracteres especiais ou espaços",
      excludeEmptyString: true,
    })
    .required(requiredMessage),
  email: yup.string().email(invalidEmailMessage).required(requiredMessage),
  password: yup
    .string()
    .max(40, fieldLimitMessage(40))
    .required(requiredMessage),
});

export type RegisterInputs = yup.InferType<typeof registerSchema>;
