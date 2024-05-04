import type { Metadata } from "next";
import Link from "next/link";
import CoffeAlt from "pixelarticons/svg/coffee-alt.svg";

import styles from "./not-found.module.css";

export const metadata: Metadata = {
  title: "Gugugram · Página não encontrada",
};

export default function NotFound() {
  return (
    <div className={styles.notFound}>
      <div className={styles.content}>
        <CoffeAlt width={24 * 5} height={24 * 5} />
        <div>
          <h2>Eta</h2>
          <p>Essa página nem existe</p>
          <Link href="/" scroll>
            Ir para tela inicial
          </Link>
        </div>
      </div>
    </div>
  );
}
