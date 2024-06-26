"use client";

import { yupResolver } from "@hookform/resolvers/yup";
import WarningBox from "pixelarticons/svg/warning-box.svg";
import { usePostHog } from "posthog-js/react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { loginAction, registerAction } from "@/actions/authentication";
import { type RegisterInputs, registerSchema } from "@/app/cadastrar/types";
import Button from "@/components/Button";
import Input from "@/components/Input";
import useFormErrors from "@/hooks/useFormErrors";
import cn from "@/utils/cn";

import styles from "./Login.module.css";

export default function Register() {
  const posthog = usePostHog();
  const [serverError, setServerError] = useState("");
  const { register, handleSubmit, control } = useForm<RegisterInputs>({
    resolver: yupResolver(registerSchema),
  });
  const fieldError = useFormErrors(control);

  const createAccount = async (data: RegisterInputs) => {
    try {
      posthog.capture("register");
      const response = await registerAction(data);
      if (response?.message) {
        setServerError(response.message);
      }
    } catch (e) {
      if (e instanceof Error) {
        setServerError(e.message);
        return;
      }
      setServerError("Algum erro estranho aconteceu");
      return;
    }

    await loginAction({ identity: data.email, password: data.password });

    location.href = `/`;
  };

  return (
    <>
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
            maxLength={14}
            pattern="[A-Za-z0-9]+"
            placeholder="Digite seu nome de usuário"
          />
          <span className="hint">
            Máximo de 14 caracteres, sem caracteres especiais
          </span>
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
            maxLength={40}
          />
        </label>
        {serverError && (
          <p className="warning-text margin-bottom">
            <WarningBox /> {serverError}
          </p>
        )}
        <Button>Criar conta</Button>
      </form>
    </>
  );
}
