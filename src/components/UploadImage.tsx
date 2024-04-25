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
  const [imageSize, setImageSize] = useState(30);

  const inputFileRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const imageSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setImageSrc(reader.result?.toString() || "");
      });
      reader.readAsDataURL(e.target.files[0]);
      setOpen(true);
    }
  };

  const clearSelectedImage = () => {
    if (inputFileRef.current) inputFileRef.current.value = "";
    setImageSrc("");
  };

  const drawCrop = () => {
    if (imageRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      canvas.width = imageSize;
      canvas.height = imageSize;

      const cropArea = calculateCenter(
        imageRef.current.naturalWidth,
        imageRef.current.naturalHeight,
        imageSize,
      );

      ctx!.drawImage(
        imageRef.current,
        cropArea.x,
        cropArea.y,
        imageSize,
        imageSize,
        cropArea.canvasX,
        cropArea.canvasY,
        imageSize,
        imageSize,
      );
    }
  };

  const publish = () => {
    if (canvasRef.current) {
      const link = document.createElement("a");
      link.download = "cropped-image.png";
      link.href = canvasRef.current.toDataURL("image/png");
      link.click();
      link.remove();
    }
  };

  useEffect(() => {
    if (!open && imageSrc) clearSelectedImage();
  }, [open]);

  useEffect(() => {
    drawCrop();
  }, [imageSize]);

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
          <DialogTitle>Subir imagem</DialogTitle>
          <DialogDescription>
            Você pode escolher o tamanho da imagem antes de subi-la.
          </DialogDescription>
        </DialogHeader>
        <DialogMain>
          {imageSrc && (
            <div className={styles.imageSettings}>
              <div className={styles.imageSettingsColumns}>
                <fieldset>
                  <legend>Escolha o tamanho da imagem</legend>
                  {imageOptions.map((imageOption) => (
                    <label
                      key={`image-option-${imageOption}`}
                      className={styles.label}
                    >
                      <Input
                        type="radio"
                        name="image-size"
                        value={imageOption}
                        onChange={() => setImageSize(imageOption)}
                        checked={imageOption === imageSize}
                      />
                      {imageOption}px²
                    </label>
                  ))}
                </fieldset>
              </div>
              <div className={styles.imageSettingsColumns}>
                <p>Tamanho original</p>
                <div className={styles.imageWrap}>
                  <img
                    ref={imageRef}
                    src={imageSrc}
                    onLoad={drawCrop}
                    width={imageSize}
                    height={imageSize}
                    className={styles.image}
                  />
                </div>
                <p>Zooooooom</p>
                <div className={styles.imageZoomWrap}>
                  <canvas
                    ref={canvasRef}
                    className={styles.imageZoom}
                    style={{
                      transform: `scale(${120 / imageSize})`,
                      transformOrigin: "0 0",
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </DialogMain>
        <DialogFooter>
          <div>
            <Button onClick={publish}>Publicar</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const imageOptions = [5, 10, 15, 20, 30];

function calculateCenter(
  cropWidth: number,
  cropHeight: number,
  imageSize: number,
) {
  let x = 0;
  let y = 0;
  let canvasX = 0;
  let canvasY = 0;

  if (cropWidth > imageSize) {
    x = Math.floor(cropWidth / 2 - imageSize / 2);
  } else {
    canvasX = Math.floor(imageSize / 2 - cropWidth / 2);
  }

  if (cropHeight > imageSize) {
    y = Math.floor(cropHeight / 2 - imageSize / 2);
  } else {
    canvasY = Math.floor(imageSize / 2 - cropHeight / 2);
  }

  return { x, y, canvasX, canvasY };
}
