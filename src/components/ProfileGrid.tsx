import MoodSad from "pixelarticons/svg/mood-sad.svg";

import styles from "./ProfileGrid.module.css";

export default function ProfileGrid({
  owner,
  images,
}: {
  owner: boolean;
  images: { id: number; url: string }[];
}) {
  const noImages = images.length === 0;
  return (
    <div className={styles.grid}>
      {images.map((image) => (
        <img
          key={`image-${image.id}`}
          src={image.url}
          alt={`Image number ${image.id}`}
          width="105px"
          height="105px"
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
