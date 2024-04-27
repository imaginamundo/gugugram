"use client";

import Link from "next/link";
import MoodHappy from "pixelarticons/svg/mood-happy.svg";

import { logoutAction } from "@/actions/authentication";
import Button from "@/components/Button";

import styles from "./HeaderUser.module.css";

type Session = {
  user: {
    username: string;
  };
};

export default function HeaderUser({ session }: { session: Session }) {
  return (
    <>
      {session?.user && (
        <div className={styles.headerUser}>
          <Link href={`/${session.user.username}`} className={styles.user}>
            <span className="border-radius profile-picture">
              <MoodHappy />
            </span>
            {session.user.username}
          </Link>
          <Button variant="link" onClick={() => logoutAction()}>
            Sair
          </Button>
        </div>
      )}
      {!session?.user && (
        <nav>
          <Link href="/entrar">Entrar</Link> ou{" "}
          <Link href="/cadastrar">Cadastrar</Link>
        </nav>
      )}
    </>
  );
}
