"use client";

import Button from "@components/Button";
import Input from "@components/Input";
import { yupResolver } from "@hookform/resolvers/yup";
import useFormErrors from "@hooks/useFormErrors";
import cn from "@utils/cn";
import yup from "@utils/yup";
import { useForm } from "react-hook-form";

import loginAction from "./action";
import styles from "./page.module.css";
import { type LoginInputs, loginSchema } from "./types";

export default function Login() {
  const { register, control } = useForm<LoginInputs>({
    resolver: yupResolver(loginSchema),
  });
  const fieldError = useFormErrors(control);

  return (
    <main className="container">
      <h1>Entrar</h1>
      <form
        className={cn("border-radius", styles.form)}
        action={async (formData) => loginAction(formData)}
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
