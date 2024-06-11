import yup from "@/utils/yup";

const requiredMessage = "Campo obrigatório";
const fieldLimitMessage = (n: number) =>
  `Campo pode ter até ${n.toString()} caracteres`;

export const newPasswordSchema = yup.object({
  newPassword: yup
    .string()
    .max(40, fieldLimitMessage(40))
    .required(requiredMessage),
});

export type NewPasswordInputs = yup.InferType<typeof newPasswordSchema>;
