"use client";

import { yupResolver } from "@hookform/resolvers/yup";
import type { Metadata } from "next";
import WarningBox from "pixelarticons/svg/warning-box.svg";
import { usePostHog } from "posthog-js/react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { forgotPasswordAction } from "@/actions/authentication";
import {
  type ForgotPasswordInputs,
  forgotPasswordSchema,
} from "@/app/esqueci-minha-senha/types";
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

export default function ForgotPassword() {
  const posthog = usePostHog();
  const [serverError, setServerError] = useState("");
  const { register, handleSubmit, control } = useForm<ForgotPasswordInputs>({
    resolver: yupResolver(forgotPasswordSchema),
  });
  const fieldError = useFormErrors(control);

  const sendEmail = async (data: ForgotPasswordInputs) => {
    try {
      posthog.capture("forgot-password");
      const response = await forgotPasswordAction(data);
      if (response?.message) {
        setServerError(response.message);
      }
    } catch (e) {
      if (e instanceof Error) {
        return setServerError(e.message);
      }
      setServerError("Algum erro estranho aconteceu");
    }

    console.log("E-mail enviado com sucesso");
  };

  return (
    <>
      <h1>Esqueci minha senha</h1>
      <p className="margin-bottom">
        Será enviado um e-mail para você cadastrar uma nova senha.
      </p>
      <form
        className={cn("border-radius", styles.form)}
        onSubmit={handleSubmit(sendEmail)}
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
        {serverError && (
          <p className="warning-text margin-bottom">
            <WarningBox /> {serverError}
          </p>
        )}
        <Button>Enviar e-mail</Button>
      </form>
    </>
  );
}
