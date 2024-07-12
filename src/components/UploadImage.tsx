"use client";

import CameraAdd from "pixelarticons/svg/camera-add.svg";
import ImagePlus from "pixelarticons/svg/image-plus.svg";
import { usePostHog } from "posthog-js/react";
import { useRef, useState } from "react";

import buttonStyles from "@/components/Button.module.css";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/Dialog";
import Input from "@/components/Input";
import UploadImageContent from "@/components/UploadImageContent";
import cn from "@/utils/cn";

import styles from "./UploadImage.module.css";

export default function UploadImage({ tiny = false }) {
  const posthog = usePostHog();

  const [open, setOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState("");

  const inputFileRef = useRef<HTMLInputElement>(null);

  const toggleOpen = (open: boolean) => {
    if (!open) {
      // Close image upload
      if (inputFileRef.current) inputFileRef.current.value = "";
      setImageSrc("");
    }

    setOpen(open);
  };

  const imageSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    posthog.capture("image_selected");

    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();

      reader.addEventListener("load", () => {
        toggleOpen(true);
        setImageSrc(reader.result?.toString() || "");
      });

      reader.readAsDataURL(e.target.files[0]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={toggleOpen}>
      <label className={cn(buttonStyles.buttonDefault, styles.addImageLabel)}>
        {!tiny && (
          <>
            <ImagePlus />
            Adicionar nova foto
          </>
        )}
        {tiny && <CameraAdd />}
        <Input
          ref={inputFileRef}
          type="file"
          accept="image/*"
          className={styles.addImageInput}
          onChange={imageSelected}
        />
      </label>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Subir imagem</DialogTitle>
          <DialogDescription>
            Você pode escolher o tamanho da imagem antes de subi-la.
          </DialogDescription>
        </DialogHeader>
        {imageSrc && <UploadImageContent imageSrc={imageSrc} />}
      </DialogContent>
    </Dialog>
  );
}
