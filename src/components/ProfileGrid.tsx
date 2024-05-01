import MoodSad from "pixelarticons/svg/mood-sad.svg";

import type { DisplayImageType } from "@/actions/user";

import styles from "./ProfileGrid.module.css";

export default function ProfileGrid({
  owner,
  images,
}: {
  owner: boolean;
  images: DisplayImageType[];
}) {
  const noImages = images.length === 0;
  return (
    <div className={styles.grid}>
      {images.map((image) => (
        <img
          key={`image-${image.id}`}
          src={image.image}
          alt={`Image number ${image.id}`}
          className={styles.image}
        />
      ))}
      {noImages && (
        <p>
          Nenhuma imagem <MoodSad />
        </p>
      )}
    </div>
  );
}
