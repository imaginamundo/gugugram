import type { Metadata } from "next";

import LastPosts from "@/components/LastPosts";

import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Gugugram · Página inicial",
  description: "Your 15x15 image repository",
};

export const dynamic = "force-dynamic";
export default function Home() {
  return (
    <main className="container">
      A sua rede social de compartilhar imagens feitas com 5px², 10px², 15px² e
      20px².
      <h1 className={styles.title}>Últimas imagens</h1>
      <LastPosts />
    </main>
  );
}
