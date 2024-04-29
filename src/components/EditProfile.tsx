"use client";

import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";
import ArrowLeft from "pixelarticons/svg/arrow-left.svg";
import ImagePlus from "pixelarticons/svg/image-plus.svg";
import MoodHappy from "pixelarticons/svg/mood-happy.svg";
import WarningBox from "pixelarticons/svg/warning-box.svg";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { ProfileInformationType, updateProfile } from "@/actions/profile";
import Button from "@/components/Button";
import buttonStyles from "@/components/Button.module.css";
import Input from "@/components/Input";
import useFormErrors from "@/hooks/useFormErrors";
import cn from "@/utils/cn";
import yup from "@/utils/yup";

import styles from "./EditProfile.module.css";

export default function EditProfile({
  user,
}: {
  user: ProfileInformationType;
}) {
  console.log({ user });
  const route = useRouter();

  const [serverError, setServerError] = useState("");
  const { register, handleSubmit, control } = useForm<EditProfileInputs>({
    defaultValues: {
      image: user.profile?.image || "",
      // username: user.username || "",
      description: user.profile?.description || "",
    },
    resolver: yupResolver(editProfileSchema),
  });
  const fieldError = useFormErrors(control);

  const editProfile = async (data: EditProfileInputs) => {
    await updateProfile({
      userId: user.id,
      profileId: user.profile?.id,
      ...data,
    });
    route.push(`/${user.username}`);
  };

  return (
    <div className="border-radius">
      <form
        className={cn("border-radius", styles.form)}
        onSubmit={handleSubmit(editProfile)}
      >
        <p>Foto de perfil</p>
        <div className={styles.profilePictureWrapper}>
          <label className={buttonStyles.buttonDefault}>
            <ImagePlus />
            Alterar foto do perfil
            <Input
              {...register("image")}
              {...fieldError("image")}
              className={styles.addImageInput}
              type="file"
              accept="image/*"
            />
          </label>
          <div className="profile-picture border-radius">
            <MoodHappy />
          </div>
          <ArrowLeft />
        </div>
        {/* <label className={styles.label}>
          Nome de usuário
          <Input
            {...register("username")}
            {...fieldError("username")}
            placeholder="Digite seu nome de usuário"
          />
        </label> */}
        <label className={styles.label}>
          Descrição
          <Input
            {...register("description")}
            {...fieldError("description")}
            placeholder="Digite sua descrição"
          />
        </label>
        {serverError && (
          <p className="warning-text margin-bottom">
            <WarningBox /> {serverError}
          </p>
        )}
        <Button>Atualizar dados</Button>
      </form>
    </div>
  );
}

const requiredMessage = "Campo obrigatório";
const fieldLimitMessage = (n: number) =>
  `Campo pode ter até ${n.toString()} caracteres`;

export const editProfileSchema = yup.object({
  image: yup.string(),
  // username: yup
  //   .string()
  //   .matches(/^[a-zA-Z0-9]+$/, {
  //     message: "Apenas caracteres de A a z sem espaços",
  //     excludeEmptyString: true,
  //   })
  //   .required(requiredMessage),
  description: yup
    .string()
    .max(160, fieldLimitMessage(160))
    .required(requiredMessage),
});

export type EditProfileInputs = yup.InferType<typeof editProfileSchema>;
