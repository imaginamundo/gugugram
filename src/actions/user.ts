"use server";

import { notFound } from "next/navigation";

import { db } from "@/database/postgres";

export async function profileInformation(username: string) {
  const user = await db.query.users.findFirst({
    where: (user, { eq }) => eq(user.username, username),
    columns: {
      username: true,
      profilePicture: true,
      description: true,
    },
    with: {
      images: {
        // orderBy: (images, { asc }) => [asc(images.id)],
        columns: {
          id: true,
          url: true,
        },
      },
    },
  });

  if (!user) return notFound();

  return user;
}
