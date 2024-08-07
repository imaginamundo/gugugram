import { usePostHog } from "posthog-js/react";
import { useContext, useEffect, useRef, useState } from "react";

import { uploadImage } from "@/actions/image";
import Button from "@/components/Button";
import { DialogFooter, DialogMain } from "@/components/Dialog";
import Input from "@/components/Input";
import { useToast } from "@/hooks/useToast";
import { LoaderContext } from "@/providers/Loader";
import cn from "@/utils/cn";

import styles from "./UploadImage.module.css";

export default function UploadImageContent({ imageSrc }: { imageSrc: string }) {
  const posthog = usePostHog();
  const loaderContext = useContext(LoaderContext);

  const { toast } = useToast();

  const [imageSize, setImageSize] = useState(30);
  const [imageResize, setImageResize] = useState(false);

  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const changeImageSettings = ({
    size,
    resize,
  }: {
    size?: number;
    resize?: boolean;
  }) => {
    if (size) {
      drawCrop({
        image: imageRef.current!,
        canvas: canvasRef.current!,
        size,
        resize: imageResize,
      });

      return setImageSize(size);
    }
    if (typeof resize === "boolean") {
      drawCrop({
        image: imageRef.current!,
        canvas: canvasRef.current!,
        size: imageSize,
        resize,
      });

      return setImageResize(resize);
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

  const downloadImage = () => {
    const link = document.createElement("a");
    link.href = imageSrc;
    link.download = "original.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const imageClasses = [styles.image];
  if (imageResize) imageClasses.push(styles.imageResized);

  useEffect(() => {
    if (!imageRef.current?.complete) {
      setTimeout(() => {
        drawCrop({
          image: imageRef.current!,
          canvas: canvasRef.current!,
          size: imageSize,
          resize: imageResize,
        });
      }, 250);
    }
  });

  return (
    <>
      <DialogMain>
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
                    onChange={() => changeImageSettings({ size: imageOption })}
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
                  onChange={() => changeImageSettings({ resize: !imageResize })}
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
                onLoad={() =>
                  drawCrop({
                    image: imageRef.current!,
                    canvas: canvasRef.current!,
                    size: imageSize,
                    resize: imageResize,
                  })
                }
                alt="Image to be uploaded"
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
      </DialogMain>
      <DialogFooter className={styles.dialogFooter}>
        <Button onClick={downloadImage}>Baixar original</Button>
        <Button onClick={publish}>Publicar</Button>
      </DialogFooter>
    </>
  );
}

const imageOptions = [5, 10, 15, 20, 30];

// https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage
type CanvasOptions = [
  sourceX: number,
  sourceY: number,
  sourceWidth: number,
  sourceHeight: number,
  destinationX: number,
  destinationY: number,
  destinationWidth: number,
  destinationHeight: number,
];

export function calculateCropCenter(
  naturalWidth: number,
  naturalHeight: number,
  imageSize: number,
  imageResize: boolean,
): CanvasOptions {
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

const drawCrop = ({
  image,
  canvas,
  size,
  resize,
}: {
  image: HTMLImageElement;
  canvas: HTMLCanvasElement;
  size: number;
  resize: boolean;
}) => {
  if (image && canvas) {
    const ctx = canvas.getContext("2d");
    canvas.width = size;
    canvas.height = size;

    const options = calculateCropCenter(
      image.naturalWidth,
      image.naturalHeight,
      size,
      resize,
    );

    ctx!.drawImage(image, ...options);
  }
};
