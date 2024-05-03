"use client";

import EyeClosed from "pixelarticons/svg/eye-closed.svg";
import MoodSad from "pixelarticons/svg/mood-sad.svg";
import Trash from "pixelarticons/svg/trash.svg";

import { deleteImage as deleteImageAction } from "@/actions/image";
import { UserInformationType } from "@/actions/search";
import type { DisplayImageType } from "@/actions/user";
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
import ImageZoom from "@/components/ImageZoom";

import styles from "./ProfileGrid.module.css";

export default function ProfileGrid({
  owner,
  user,
  images,
}: {
  owner: boolean;
  user: UserInformationType;
  images: DisplayImageType[];
}) {
  const noImages = images.length === 0;

  const deleteImage = async (id: string, imageUrl: string) => {
    if (user.id) {
      await deleteImageAction({ id, userId: user.id, imageUrl });
      location.reload();
    }
  };
  return (
    <div className={styles.grid}>
      {images.map((image) => (
        <div key={`image-${image.id}`} className={styles.imageWrapper}>
          {owner && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="link" className={styles.remove}>
                  <Trash className={styles.removeIcon} />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Vai deletar mesmo?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Não tem volta <EyeClosed />
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction asChild>
                    <Button
                      variant="destructive"
                      onClick={() => deleteImage(image.id, image.image)}
                    >
                      <Trash />
                      Deletar
                    </Button>
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <ImageZoom username={user.username} image={image.image}>
            <img
              src={image.image}
              alt={`Image number ${image.id}`}
              className={styles.image}
            />
          </ImageZoom>
        </div>
      ))}
      {noImages && (
        <p>
          Nenhuma imagem <MoodSad />
        </p>
      )}
    </div>
  );
}
