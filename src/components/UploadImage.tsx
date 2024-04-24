"use client";

import Button from "@components/Button";
import buttonStyles from "@components/Button.module.css";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogMain,
  DialogTitle,
} from "@components/Dialog";
import Input from "@components/Input";
import cn from "@utils/cn";
import ImagePlus from "pixelarticons/svg/image-plus.svg";
import { useEffect, useRef, useState } from "react";

import styles from "./UploadImage.module.css";

export default function UploadImage() {
  const [open, setOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState("");
  const [imageSize, setImageSize] = useState(20);

  const inputFileRef = useRef<HTMLInputElement>(null);

  const imageSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener("load", () =>
        setImageSrc(reader.result?.toString() || ""),
      );
      reader.readAsDataURL(e.target.files[0]);
      setOpen(true);
    }
  };

  const clearSelectedImage = () => {
    if (inputFileRef.current) inputFileRef.current.value = "";
    setImageSrc("");
  };

  useEffect(() => {
    if (!open && imageSrc) clearSelectedImage();
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <label className={cn(buttonStyles.buttonDefault, styles.addImageLabel)}>
        <ImagePlus />
        Adicionar nova foto
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
          <DialogTitle>Subir Foto</DialogTitle>
          <DialogDescription>
            Você pode escolher o tamanho da imagem antes de subi-la.
          </DialogDescription>
        </DialogHeader>
        <DialogMain>
          {imageSrc && (
            <img
              alt="Cropped"
              src={imageSrc}
              width={imageSize}
              height={imageSize}
              className={styles.image}
            />
          )}
        </DialogMain>
        <DialogFooter>
          <div>
            {imageOptions.map((imageOption) => (
              <Button
                key={`image-option-${imageOption}`}
                onClick={() => setImageSize(imageOption)}
              >
                {imageOption}px²
              </Button>
            ))}
            <Button>Subir imagem</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const imageOptions = [5, 10, 15, 20];
