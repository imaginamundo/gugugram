import yup from "@/utils/yup";

const requiredMessage = "Campo obrigatório";
const fieldLimitMessage = (n: number) =>
  `Campo pode ter até ${n.toString()} caracteres`;
const invalidEmailMessage = "E-mail invalido";

export const registerSchema = yup.object({
  username: yup
    .string()
    .matches(/^[a-zA-Z0-9]+$/, {
      message: "Apenas caracteres de A a z sem espaços",
      excludeEmptyString: true,
    })
    .required(requiredMessage),
  email: yup.string().email(invalidEmailMessage).required(requiredMessage),
  password: yup
    .string()
    .max(14, fieldLimitMessage(14))
    .required(requiredMessage),
});

export type RegisterInputs = yup.InferType<typeof registerSchema>;