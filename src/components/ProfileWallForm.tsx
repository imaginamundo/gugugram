"use client";

import { yupResolver } from "@hookform/resolvers/yup";
import MailArrowRight from "pixelarticons/svg/mail-arrow-right.svg";
import { useForm } from "react-hook-form";

import { addMessage } from "@/actions/message";
import Button from "@/components/Button";
import Input from "@/components/Input";
import yup from "@/utils/yup";

import styles from "./ProfileWallForm.module.css";

export default function ProfileWallForm({ userId }: { userId: string }) {
  const { register, handleSubmit } = useForm<Inputs>({
    resolver: yupResolver(schema),
  });

  const sendMessage = async (data: Inputs) => {
    await addMessage(userId, data.message);
    location.reload();
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit(sendMessage)}>
      <Input
        {...register("message")}
        type="text"
        className={styles.input}
        placeholder="Escreva aqui seu recado…"
      />

      <Button className={styles.noWrap}>
        <MailArrowRight />
        Enviar recado
      </Button>
    </form>
  );
}

const schema = yup.object({
  message: yup.string().required(),
});

type Inputs = yup.InferType<typeof schema>;
