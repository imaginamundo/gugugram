"use client";

import { yupResolver } from "@hookform/resolvers/yup";
import type { Metadata } from "next";
import WarningBox from "pixelarticons/svg/warning-box.svg";
import { usePostHog } from "posthog-js/react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { loginAction } from "@/actions/authentication";
import { type LoginInputs, loginSchema } from "@/app/entrar/types";
import Button from "@/components/Button";
import Input from "@/components/Input";
import useFormErrors from "@/hooks/useFormErrors";
import cn from "@/utils/cn";

import styles from "./Login.module.css";

export const metadata: Metadata = {
  title: "Entrar",
  description: "Faça parte de uma rede social",
  robots: {
    index: false,
    follow: false,
  },
};

export default function Login() {
  const posthog = usePostHog();
  const [serverError, setServerError] = useState("");
  const { register, handleSubmit, control } = useForm<LoginInputs>({
    resolver: yupResolver(loginSchema),
  });
  const fieldError = useFormErrors(control);

  const authenticate = async (data: LoginInputs) => {
    try {
      posthog.capture("login");
      await loginAction(data);
    } catch (e) {
      if (e instanceof Error) {
        return setServerError(e.message);
      }
      setServerError("Algum erro estranho aconteceu");
    }
  };

  return (
    <>
      <h1>Entrar</h1>
      <form
        className={cn("border-radius", styles.form)}
        onSubmit={handleSubmit(authenticate)}
      >
        <label className={styles.label}>
          Nome de usuário ou e-mail
          <Input
            {...register("identity")}
            {...fieldError("identity")}
            placeholder="Seu nome de usuário ou email"
            autoComplete="username"
          />
          14 caracteres de tamanho máximo, sem caracteres especiais
        </label>
        <label className={styles.label}>
          Senha
          <Input
            {...register("password")}
            {...fieldError("password")}
            placeholder="******"
            autoComplete="current-password"
            type="password"
            maxLength={40}
          />
        </label>
        {serverError && (
          <p className="warning-text margin-bottom">
            <WarningBox /> {serverError}
          </p>
        )}
        <Button>Entrar</Button>
      </form>
    </>
  );
}
