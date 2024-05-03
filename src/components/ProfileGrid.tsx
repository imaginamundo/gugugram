"use client";

import EyeClosed from "pixelarticons/svg/eye-closed.svg";
import MoodSad from "pixelarticons/svg/mood-sad.svg";
import Trash from "pixelarticons/svg/trash.svg";

import { deleteImage as deleteImageAction } from "@/actions/image";
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

import styles from "./ProfileGrid.module.css";

export default function ProfileGrid({
  owner,
  images,
}: {
  owner: boolean;
  images: DisplayImageType[];
}) {
  const noImages = images.length === 0;

  const deleteImage = async (id: string) => {
    await deleteImageAction(id);
    location.reload();
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
                      onClick={() => deleteImage(image.id)}
                    >
                      <Trash />
                      Deletar
                    </Button>
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <img
            src={image.image}
            alt={`Image number ${image.id}`}
            className={styles.image}
          />
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
