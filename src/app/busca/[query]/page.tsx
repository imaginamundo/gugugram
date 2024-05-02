import type { Metadata } from "next";
import Link from "next/link";

import { searchUsers } from "@/actions/search";

import styles from "./page.module.css";
import cn from "@/utils/cn";

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
                <img
                  className="border-radius profile-picture"
                  src={user.profile.image || ""}
                  alt={user.username}
                />
              </Link>
              <Link href={`/${user.username}`}>{user.username}</Link>
            </div>
          );
        })}
      </div>
    </main>
  );
}
