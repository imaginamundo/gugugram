import styles from "./ProfileGrid.module.css";
import type { ProfileData } from "@api/profile/[username]/route";

export default function ProfileGrid({
  owner,
  images,
}: {
  owner: boolean;
  images: ProfileData["images"];
}) {
  return (
    <div className={styles.grid}>
      {images.map((image) => (
        <img
          key={`image-${image.id}`}
          src={image.url}
          alt={image.description}
          width="120"
          height="120"
        />
      ))}
    </div>
  );
}
