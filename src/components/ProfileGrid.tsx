import styles from "./ProfileGrid.module.css";

export default function ProfileGrid({
  owner,
  images,
}: {
  owner: boolean;
  images: { id: number; url: string }[];
}) {
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
    </div>
  );
}
