"use client";

import CameraAdd from "pixelarticons/svg/camera-add.svg";
import ImagePlus from "pixelarticons/svg/image-plus.svg";
import { usePostHog } from "posthog-js/react";
import { useContext, useEffect, useRef, useState } from "react";

import { uploadImage } from "@/actions/image";
import Button from "@/components/Button";
import buttonStyles from "@/components/Button.module.css";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogMain,
  DialogTitle,
} from "@/components/Dialog";
import Input from "@/components/Input";
import { useToast } from "@/hooks/useToast";
import { LoaderContext } from "@/providers/Loader";
import cn from "@/utils/cn";

import styles from "./UploadImage.module.css";

export default function UploadImage({ tiny = false }) {
  const loaderContext = useContext(LoaderContext);
  const posthog = usePostHog();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState("");
  const [imageSize, setImageSize] = useState(30);
  const [imageResize, setImageResize] = useState(false);

  const inputFileRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const imageSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    posthog.capture("image_selected");

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
    setImageResize(false);
  };

  const drawCrop = () => {
    if (imageRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      canvas.width = imageSize;
      canvas.height = imageSize;

      const options = calculateCropCenter(
        imageRef.current.naturalWidth,
        imageRef.current.naturalHeight,
        imageSize,
        imageResize,
      );

      ctx!.drawImage(imageRef.current, ...options);
    }
  };

  const publish = () => {
    posthog.capture("publish_image");
    loaderContext?.setLoading(true);
    if (canvasRef.current) {
      canvasRef.current.toBlob((blob) => {
        if (!blob) return;

        const data = new FormData();
        data.append("image", blob);

        try {
          uploadImage(data).then((response) => {
            if (response?.message) {
              return toast({
                title: "Ops",
                description: response.message,
                variant: "destructive",
              });
            }
            if (response?.username) {
              return (location.href = `/${response.username}`);
            }
          });
        } catch (e) {
          if (e instanceof Error && e?.message) {
            return toast({
              title: "Ops",
              description: e.message,
              variant: "destructive",
            });
          }
        }
      }, "image/png");
    }
  };

  useEffect(() => {
    if (!open && imageSrc) clearSelectedImage();
  }, [open]);

  useEffect(() => {
    drawCrop();
  }, [imageSize, imageResize]);

  const imageClasses = [styles.image];
  if (imageResize) imageClasses.push(styles.imageResized);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
        <DialogMain>
          {imageSrc && (
            <div className={styles.imageSettings}>
              <div className={styles.imageSettingsColumn}>
                <fieldset>
                  <legend>Tamanho da imagem:</legend>
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

                  <label className={cn(styles.label, styles.imageResize)}>
                    <Input
                      type="checkbox"
                      name="image-resize"
                      value={imageResize.toString()}
                      onChange={() => setImageResize(!imageResize)}
                      checked={imageResize}
                    />
                    Redimensionar
                  </label>
                </fieldset>
              </div>
              <div className={styles.imagePreviewColumn}>
                <p>Original</p>
                <div className={styles.imageWrap}>
                  <img
                    ref={imageRef}
                    src={imageSrc}
                    alt="Image to be uploaded"
                    onLoad={drawCrop}
                    width={imageSize}
                    height={imageSize}
                    className={cn(imageClasses)}
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

export function calculateCropCenter(
  naturalWidth: number,
  naturalHeight: number,
  imageSize: number,
  imageResize: boolean,
) {
  let x = 0;
  let y = 0;

  if (imageResize) {
    const smallestSize = Math.min(naturalWidth, naturalHeight);
    const largestSize = Math.max(naturalWidth, naturalHeight);
    const biggestSize = naturalWidth > naturalHeight ? "width" : "heigth";

    const delta = largestSize / 2 - smallestSize / 2;

    if (biggestSize === "width") {
      x = delta;
    } else {
      y = delta;
    }

    return [x, y, smallestSize, smallestSize, 0, 0, imageSize, imageSize];
  }

  let canvasX = 0;
  let canvasY = 0;

  // Center crop width
  if (naturalWidth > imageSize) {
    x = Math.floor(naturalWidth / 2 - imageSize / 2);
  } else {
    canvasX = Math.floor(imageSize / 2 - naturalWidth / 2);
  }

  // Center crop height
  if (naturalHeight > imageSize) {
    y = Math.floor(naturalHeight / 2 - imageSize / 2);
  } else {
    canvasY = Math.floor(imageSize / 2 - naturalHeight / 2);
  }

  return [x, y, imageSize, imageSize, canvasX, canvasY, imageSize, imageSize];
}
