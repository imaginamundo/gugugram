"use server";

import { desc } from "drizzle-orm";

import { db } from "@/database/postgres";
import { images } from "@/database/schema";

export async function lastPosts() {
  return db.query.images.findMany({
    with: { author: true },
    orderBy: desc(images.createdAt),
    limit: 50,
  });
}
