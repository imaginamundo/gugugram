import { auth } from "@/app/auth";
import UploadImage from "@/components/UploadImage";

import styles from "./AddPicture.module.css";

export default async function AddPicture() {
  const session = await auth();

  if (!session) return null;

  return (
    <div className={styles.floatingButton}>
      <UploadImage tiny />
    </div>
  );
}
