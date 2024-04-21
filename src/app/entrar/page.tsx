"use client";

import Button from "@components/Button";
import Input from "@components/Input";
import { yupResolver } from "@hookform/resolvers/yup";
import useFormErrors from "@hooks/useFormErrors";
import cn from "@utils/cn";
import yup from "@utils/yup";
import { useForm } from "react-hook-form";

import styles from "./page.module.css";

export default function Login() {
  const { register, handleSubmit, control } = useForm<Inputs>({
    resolver: yupResolver(schema),
  });
  const fieldError = useFormErrors(control);

  const authenticate = (data: Inputs) => {
    console.log(data);
  };

  return (
    <main className="container">
      <h1>Entrar</h1>
      <form
        className={cn("border-radius", styles.form)}
        onSubmit={handleSubmit(authenticate)}
      >
        <label className={styles.label}>
          E-mail
          <Input
            {...register("email")}
            {...fieldError("email")}
            placeholder="email@provedor.com.br"
            type="email"
            autoComplete="email"
          />
        </label>
        <label className={styles.label}>
          Senha
          <Input
            {...register("password")}
            {...fieldError("password")}
            placeholder="******"
            autoComplete="current-password"
            type="password"
          />
        </label>
        <Button>Entrar</Button>
      </form>
    </main>
  );
}

const requiredMessage = "Campo obrigatório";
const invalidEmailMessage = "E-mail invalido";

const schema = yup
  .object({
    email: yup.string().email(invalidEmailMessage).required(requiredMessage),
    password: yup.string().required(requiredMessage),
  })
  .required();

type Inputs = yup.InferType<typeof schema>;
