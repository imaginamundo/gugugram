"use client";

import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";
import ArrowLeft from "pixelarticons/svg/arrow-left.svg";
import ImagePlus from "pixelarticons/svg/image-plus.svg";
import MoodHappy from "pixelarticons/svg/mood-happy.svg";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";

import { ProfileInformationType, updateProfile } from "@/actions/profile";
import Button from "@/components/Button";
import buttonStyles from "@/components/Button.module.css";
import Input from "@/components/Input";
import Loader from "@/components/Loader";
import { calculateCropCenter } from "@/components/UploadImage";
import useFormErrors from "@/hooks/useFormErrors";
import cn from "@/utils/cn";
import yup from "@/utils/yup";

import styles from "./EditProfile.module.css";
import { usePostHog } from "posthog-js/react";

export default function EditProfile({
  user,
}: {
  user: ProfileInformationType;
}) {
  const route = useRouter();
  const posthog = usePostHog();

  const [loading, setLoading] = useState(false);
  const [imageSrc, setImageSrc] = useState("");
  const { register, handleSubmit, control } = useForm<EditProfileInputs>({
    defaultValues: {
      image: user.profile?.image || "",
      file: "",
      // username: user.username || "",
      description: user.profile?.description || "",
    },
    resolver: yupResolver(editProfileSchema),
  });
  const fieldError = useFormErrors(control);

  const imageRef = useRef<HTMLImageElement>(null);

  const editProfile = async (data: EditProfileInputs) => {
    posthog.capture("edit_profile");
    setLoading(true);
    const formData = new FormData();
    if (data.image) formData.append("image", data.image);
    if (data.file && imageRef.current) {
      const createBlob = () =>
        new Promise((resolve, reject) => {
          if (!imageRef.current) return reject();
          const canvas = drawCanvas(imageRef.current);
          canvas.toBlob((blob) => {
            if (!blob) return;
            resolve(blob);
          });
        });

      const blob = (await createBlob()) as Blob;
      formData.append("file", blob);
    }
    formData.append("description", data.description);

    if (user.profile?.id) formData.append("profileId", user.profile.id);

    await updateProfile(formData);

    setLoading(false);

    route.push(`/${user.username}`);
  };

  const imageSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setImageSrc(reader.result?.toString() || "");
      });
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  return (
    <>
      <Loader loading={loading} />
      <div className="border-radius">
        <form
          className={cn("border-radius", styles.form)}
          onSubmit={handleSubmit(editProfile)}
        >
          <p>Foto de perfil</p>
          <div className={styles.profilePictureWrapper}>
            <Input type="hidden" {...register("image")} />
            <label className={buttonStyles.buttonDefault}>
              <ImagePlus />
              Alterar foto do perfil
              <Input
                {...register("file", { onChange: imageSelected })}
                {...fieldError("file")}
                className={styles.addImageInput}
                type="file"
                accept="image/*"
              />
            </label>
            {(imageSrc || user.profile?.image) && (
              <img
                src={imageSrc || user.profile?.image || ""}
                ref={imageRef}
                alt="Foto do perfil"
                className="profile-picture border-radius"
              />
            )}
            {!imageSrc && !user.profile?.image && (
              <div className="profile-picture border-radius">
                <MoodHappy />
              </div>
            )}
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
          <Button>Atualizar dados</Button>
        </form>
      </div>
    </>
  );
}

const drawCanvas = (image: HTMLImageElement) => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = 30;
  canvas.height = 30;

  const options = calculateCropCenter(
    image.naturalWidth,
    image.naturalHeight,
    30,
    true,
  );

  ctx!.drawImage(image, ...options);

  return canvas;
};

const requiredMessage = "Campo obrigatório";
const fieldLimitMessage = (n: number) =>
  `Campo pode ter até ${n.toString()} caracteres`;

export const editProfileSchema = yup.object({
  image: yup.string(),
  file: yup.string(),
  description: yup
    .string()
    .max(160, fieldLimitMessage(160))
    .required(requiredMessage),
});

export type EditProfileInputs = yup.InferType<typeof editProfileSchema>;
