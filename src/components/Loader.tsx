import LoaderIcon from "pixelarticons/svg/loader.svg";
import { useEffect } from "react";

import styles from "./Loader.module.css";

export default function Loader({ loading }: { loading?: boolean }) {
  useEffect(() => {
    if (loading) {
      document.body.classList.add("stop");
    } else {
      document.body.classList.remove("stop");
    }
  }, [loading]);
  return (
    <div className={styles.loader} hidden={!loading}>
      <LoaderIcon className={styles.spinner} />
      Carregando
    </div>
  );
}
