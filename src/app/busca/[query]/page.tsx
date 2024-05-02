import type { Metadata } from "next";

import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Busca",
  description: "Procurando por usuários",
  robots: {
    index: false,
    follow: false,
  },
};

export default function Home({ params }: { params: { query: string } }) {
  return (
    <main className="container">
      <h1 className={styles.title}>Busca por {params.query}</h1>
    </main>
  );
}
