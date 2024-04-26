import Image from "next/image";
import Link from "next/link";

import cn from "@/utils/cn";

import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={cn(styles.footer, "text-center")}>
      <p>
        Isso é um site. Início do desenvolvimento dia 15 de abril de 2024.
        Alguns direitos reservados
      </p>
      <Link
        href="https://www.mozilla.org/firefox"
        target="_blank"
        rel="noopener noreferrer"
        className={styles.firefox}
      >
        <Image
          src="/moz_carcar3.gif"
          width="80"
          height="31"
          alt="Baixar o Firefox agora!"
          title="Baixar o Firefox agora!"
        />
      </Link>
    </footer>
  );
}
