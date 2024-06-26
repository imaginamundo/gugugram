import Link from "next/link";

import { auth } from "@/app/auth";
import HeaderSearch from "@/components/HeaderSearch";
import HeaderUser from "@/components/HeaderUser";

import styles from "./Header.module.css";

export default async function Header() {
  const session = await auth();

  return (
    <header className={styles.header}>
      <h1>
        <Link href="/" className={styles.logo} title="Ir para página inicial">
          <span>g</span>
          <span>u</span>
          <span>g</span>
          <span>u</span>
          <span>g</span>
          <span>r</span>
          <span>a</span>
          <span>m</span>
        </Link>
      </h1>
      <HeaderSearch />
      <HeaderUser session={session} />
    </header>
  );
}
