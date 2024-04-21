import Link from "next/link";
import styles from "./Header.module.css";

export default function Header() {
  return (
    <header className={styles.header}>
      <h1 className={styles.logo}>
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
      <nav>
        <Link href="/entrar">Entrar</Link> ou{" "}
        <Link href="/cadastrar">Cadastrar</Link>
      </nav>
    </header>
  );
}
