"use client";

import Link from "next/link";
import type { Session } from "next-auth";
import MoodHappy from "pixelarticons/svg/mood-happy.svg";

import { logoutAction } from "@/actions/authentication";
import Button from "@/components/Button";

import styles from "./HeaderUser.module.css";

export default function HeaderUser({ session }: { session?: Session }) {
  const logout = async () => {
    await logoutAction();
    location.reload();
  };

  return (
    <>
      {session?.user && (
        <div className={styles.headerUser}>
          <Link href={`/${session.user.username}`} className={styles.user}>
            {session.user.image && (
              <img
                className="border-radius profile-picture"
                src={session.user.image}
                alt="Imagem de perfil do usuário"
              />
            )}
            {!session.user.image && (
              <span className="border-radius profile-picture">
                <MoodHappy />
              </span>
            )}
            {session.user.username}
          </Link>
          <Button variant="link" onClick={() => logout()}>
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
