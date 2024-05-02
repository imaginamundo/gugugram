import type { Metadata } from "next";
import Link from "next/link";
import MoodHappy from "pixelarticons/svg/mood-happy.svg";

import { searchUsers } from "@/actions/search";
import cn from "@/utils/cn";

import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Busca",
  description: "Procurando por usuários",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function Home({ params }: { params: { query: string } }) {
  const users = await searchUsers(params.query);
  return (
    <main className="container">
      <h1 className={styles.title}>Busca por &quot;{params.query}&quot;</h1>
      <div className={cn("border-radius", styles.users)}>
        {users.map((user) => {
          return (
            <div key={`search-${user.id}`} className={styles.user}>
              <Link href={`/${user.username}`}>
                {user.profile?.image && (
                  <img
                    src={user.profile.image}
                    className="border-radius profile-picture"
                    width="30"
                    height="30"
                    alt={`Imagem de perfil do ${user.username}`}
                  />
                )}

                {!user.profile?.image && (
                  <span
                    className={cn(
                      "border-radius profile-picture",
                      styles.profilePicture,
                    )}
                  >
                    <MoodHappy />
                  </span>
                )}
              </Link>
              <Link href={`/${user.username}`}>{user.username}</Link>
            </div>
          );
        })}
      </div>
    </main>
  );
}
