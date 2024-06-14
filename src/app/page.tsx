import type { Metadata } from "next";
import Link from "next/link";

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
      <p>
        A sua rede social de compartilhar imagens feitas com 5px², 10px², 15px²,
        20px² e 30px².
      </p>
      <p className="margin-top">
        <strong>
          Escute ao podcast{" "}
          <img
            src="/gugucast.png"
            alt="gugucast"
            title="gugucast"
            className={styles.gugucastImage}
          />
        </strong>
      </p>
      <p>
        Disponível no{" "}
        <Link
          href="https://open.spotify.com/show/1Dp70B6opQDEKkOl0Wa7K1?si=9491dad89b9941a2"
          target="_blank"
        >
          Spotify
        </Link>{" "}
        e{" "}
        <Link
          href="https://podcasts.apple.com/br/podcast/gugucast/id1747823025"
          target="_blank"
        >
          Apple Podcasts
        </Link>
        !
      </p>

      <h1 className={styles.title}>Últimas imagens</h1>
      <LastPosts />
    </main>
  );
}
