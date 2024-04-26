import yup from "@utils/yup";

const requiredMessage = "Campo obrigatório";
const fieldLimitMessage = (n: number) =>
  `Campo pode ter até ${n.toString()} caracteres`;
const invalidEmailMessage = "E-mail invalido";

export const loginSchema = yup.object({
  email: yup.string().email(invalidEmailMessage).required(requiredMessage),
  password: yup
    .string()
    .max(14, fieldLimitMessage(14))
    .required(requiredMessage),
});

export type LoginInputs = yup.InferType<typeof loginSchema>;
