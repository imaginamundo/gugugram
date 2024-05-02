import Link from "next/link";

import { lastPosts as lastPostsQuery } from "@/actions/lastPosts";

import styles from "./LastPosts.module.css";

export default async function LastPosts() {
  const lastPosts = await lastPostsQuery();

  const noPosts = lastPosts.length === 0;

  return (
    <div className={styles.lastPosts}>
      {lastPosts.map((post) => (
        <Link href={`/${post.author.username}`} key={`last-post-${post.id}`}>
          <img src={post.image} alt={post.image} className={styles.image} />
        </Link>
      ))}
      {noPosts && "Ainda não temos nenhuma imagem :("}
    </div>
  );
}
