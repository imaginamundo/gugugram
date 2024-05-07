"use client";

import { yupResolver } from "@hookform/resolvers/yup";
import { useSession } from "next-auth/react";
import ContactDelete from "pixelarticons/svg/contact-delete.svg";
import EyeClosed from "pixelarticons/svg/eye-closed.svg";
import ImagePlus from "pixelarticons/svg/image-plus.svg";
import MoodHappy from "pixelarticons/svg/mood-happy.svg";
import Trash from "pixelarticons/svg/trash.svg";
import { usePostHog } from "posthog-js/react";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";

import {
  deleteAccount as deleteAccoutAction,
  deleteProfileImage,
  type ProfileInformationType,
  updateProfile,
} from "@/actions/profile";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/AlertDialog";
import Button from "@/components/Button";
import buttonStyles from "@/components/Button.module.css";
import Input from "@/components/Input";
import Loader from "@/components/Loader";
import { calculateCropCenter } from "@/components/UploadImage";
import useFormErrors from "@/hooks/useFormErrors";
import { useToast } from "@/hooks/useToast";
import cn from "@/utils/cn";
import yup from "@/utils/yup";

import styles from "./EditProfile.module.css";

export default function EditProfile({
  user,
}: {
  user: ProfileInformationType;
}) {
  const posthog = usePostHog();
  const { toast } = useToast();
  const { data: session, update } = useSession();

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
    if (!session) return;

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
          }, "image/png");
        });

      const blob = (await createBlob()) as Blob;
      formData.append("file", blob);
    }
    formData.append("description", data.description ?? "");

    if (user.profile?.id) formData.append("profileId", user.profile.id);

    const response = await updateProfile(formData);
    if (response?.message) {
      toast({
        title: "Ops",
        description: response.message,
        variant: "destructive",
      });
    }

    setLoading(false);

    update({ ...session, user: { ...session.user, image: response.image } });

    location.href = `/${user.username}`;
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

  const deleteImage = async () => {
    if (!session) return;

    const response = await deleteProfileImage();
    if (response?.message) {
      return toast({
        title: "Ops",
        description: response.message,
        variant: "destructive",
      });
    }

    update({ ...session, user: { ...session.user, image: "" } });

    location.reload();
  };

  const deleteAccount = async () => {
    if (!session) return;

    const response = await deleteAccoutAction();
    if (response?.message) {
      return toast({
        title: "Ops",
        description: response.message,
        variant: "destructive",
      });
    }

    location.reload();
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
          </div>
          {user.profile?.image && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  className={styles.removeProfilePicture}
                >
                  Remover imagem de perfil
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Vai remover mesmo?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Não tem volta <EyeClosed />
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction asChild>
                    <Button variant="destructive" onClick={() => deleteImage()}>
                      <Trash />
                      Deletar
                    </Button>
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
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
      <h2 className="margin-top">Remoção de conta</h2>
      <p className="margin-top">
        A remoção de conta é permanente. Deletando sua conta você perderá todas
        as suas imagens, mensagens enviadas, amizades e tudo que guardamos no
        site.
      </p>
      <p className="margin-top">
        Todas as informações serão deletadas sem chance de recuperação.
      </p>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            className={cn(styles.removeAccount, "margin-top")}
            variant="destructive"
          >
            <ContactDelete />
            Excluir conta
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Vai deletar sua conta mesmo?</AlertDialogTitle>
            <AlertDialogDescription>
              Não tem volta <EyeClosed />
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button variant="destructive" onClick={() => deleteAccount()}>
                <Trash />
                Deletar
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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

const fieldLimitMessage = (n: number) =>
  `Campo pode ter até ${n.toString()} caracteres`;

export const editProfileSchema = yup.object({
  image: yup.string(),
  file: yup.string(),
  description: yup.string().max(160, fieldLimitMessage(160)),
});

export type EditProfileInputs = yup.InferType<typeof editProfileSchema>;
