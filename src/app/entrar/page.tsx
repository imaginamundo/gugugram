"use client";

import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";

import { loginAction } from "@/actions/authentication";
import Button from "@/components/Button";
import Input from "@/components/Input";
import useFormErrors from "@/hooks/useFormErrors";
import cn from "@/utils/cn";

import styles from "./page.module.css";
import { type LoginInputs, loginSchema } from "./types";

export default function Login() {
  const { register, handleSubmit, control } = useForm<LoginInputs>({
    resolver: yupResolver(loginSchema),
  });
  const fieldError = useFormErrors(control);

  const authenticate = async (data: LoginInputs) => {
    await loginAction(data);
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
