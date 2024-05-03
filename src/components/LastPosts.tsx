import Link from "next/link";

import { lastPosts as lastPostsQuery } from "@/actions/lastPosts";
import ImageZoom from "@/components/ImageZoom";

import styles from "./LastPosts.module.css";

export default async function LastPosts() {
  const lastPosts = await lastPostsQuery();

  const noPosts = lastPosts.length === 0;

  return (
    <div className={styles.lastPosts}>
      {lastPosts.map((post) => (
        <ImageZoom
          username={post.author.username}
          image={post.image}
          key={`last-post-${post.id}`}
        >
          <img src={post.image} alt={post.image} className={styles.image} />
        </ImageZoom>
      ))}
      {noPosts && "Ainda não temos nenhuma imagem :("}
    </div>
  );
}
