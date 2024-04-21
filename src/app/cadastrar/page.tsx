"use client";

import Button from "@components/Button";
import Input from "@components/Input";
import { yupResolver } from "@hookform/resolvers/yup";
import useFormErrors from "@hooks/useFormErrors";
import cn from "@utils/cn";
import yup from "@utils/yup";
import { useForm } from "react-hook-form";

import styles from "./page.module.css";

export default function Register() {
  const { register, handleSubmit, control } = useForm<Inputs>({
    resolver: yupResolver(schema),
  });
  const fieldError = useFormErrors(control);

  const createAccount = (data: Inputs) => {
    console.log(data);
  };

  return (
    <main className="container">
      <h1>Cadastrar</h1>
      <form
        onSubmit={handleSubmit(createAccount)}
        className={cn("border-radius", styles.form)}
      >
        <label className={styles.label}>
          Nome de usuário
          <Input
            {...register("username")}
            {...fieldError("username")}
            placeholder="Digite seu nome de usuário"
          />
        </label>
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
            id="new-password"
            type="password"
            placeholder="******"
            autoComplete="new-password"
          />
        </label>
        <Button>Criar conta</Button>
      </form>
    </main>
  );
}

const requiredMessage = "Campo obrigatório";
const invalidEmailMessage = "E-mail invalido";

const schema = yup.object({
  username: yup.string().required(requiredMessage),
  email: yup.string().email(invalidEmailMessage).required(requiredMessage),
  password: yup.string().required(requiredMessage),
});

type Inputs = yup.InferType<typeof schema>;
