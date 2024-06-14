"use client";

import { yupResolver } from "@hookform/resolvers/yup";
import WarningBox from "pixelarticons/svg/warning-box.svg";
import { usePostHog } from "posthog-js/react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { newPasswordAction } from "@/actions/authentication";
import {
  type NewPasswordInputs,
  newPasswordSchema,
} from "@/app/nova-senha/types";
import Button from "@/components/Button";
import Input from "@/components/Input";
import useFormErrors from "@/hooks/useFormErrors";
import cn from "@/utils/cn";

import styles from "./Login.module.css";

export default function NewPassword({ token }: { token?: string }) {
  const posthog = usePostHog();
  const [serverError, setServerError] = useState("");
  const { register, handleSubmit, control } = useForm<NewPasswordInputs>({
    resolver: yupResolver(newPasswordSchema),
  });
  const fieldError = useFormErrors(control);

  const createAccount = async (data: NewPasswordInputs) => {
    if (!token) return setServerError("Token inválido");

    try {
      posthog.capture("new-password");
      const response = await newPasswordAction(data, token);
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

    location.href = "/entrar?updated-password";
  };

  return (
    <>
      <h1>Cadastrar nova senha</h1>
      <p className="margin-bottom">
        Após o cadastro de nova senha você será redirecionado para a página de
        autenticação.
      </p>
      <form
        onSubmit={handleSubmit(createAccount)}
        className={cn("border-radius", styles.form)}
      >
        <label className={styles.label}>
          Senha
          <Input
            {...register("newPassword")}
            {...fieldError("newPassword")}
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
