import yup from "@/utils/yup";

const requiredMessage = "Campo obrigatório";
const invalidEmailMessage = "E-mail invalido";

export const forgotPasswordSchema = yup.object({
  email: yup.string().email(invalidEmailMessage).required(requiredMessage),
});

export type ForgotPasswordInputs = yup.InferType<typeof forgotPasswordSchema>;
