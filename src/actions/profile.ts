"use server";

import { sanitize } from "isomorphic-dompurify";
import { notFound } from "next/navigation";

import { auth } from "@/app/auth";
import { db } from "@/database/postgres";
import { userProfiles } from "@/database/schema";
import { utapi } from "@/image-upload/uploadthing";

import type { DisplayProfileType, DisplayUserType } from "./user";

export async function profileInformations() {
  const session = await auth();

  if (!session) notFound();

  const user = await db.query.users.findFirst({
    where: (user, { eq }) => eq(user.username, session.user.username),
    columns: {
      id: true,
      username: true,
    },
    with: {
      profile: {
        columns: {
          id: true,
          image: true,
          description: true,
        },
      },
    },
  });

  return user;
}
export type ProfileInformationType = DisplayUserType & {
  profile?: DisplayProfileType;
};

export async function updateProfile(data: FormData) {
  const session = await auth();
  if (!session) throw new Error("Not allowed");

  let image = (data.get("image") || "") as string;
  image = sanitize(image);

  const file = data.get("file") as Blob | undefined;
  let upload;
  if (file) {
    try {
      if (!file) throw new Error("No image selected");
      if (file.size > 10000) throw new Error("Image too big");

      upload = await utapi.uploadFiles(file);
    } catch (e) {
      throw e;
    }
  }

  if (upload?.data?.url) image = upload.data.url;

  const profileId = data.get("profileId") || undefined;
  let description = (data.get("description") || "") as string;
  description = sanitize(description);

  return await db
    .insert(userProfiles)
    .values({ id: profileId, userId: session.user.id, image, description })
    .onConflictDoUpdate({
      target: [userProfiles.id, userProfiles.userId],
      set: { image, description },
    })
    .returning({ image: userProfiles.image });
}
export type EditProfileInformationType = {
  userId: string;
  profileId?: string;
  image?: string;
  // username: string;
  description: string;
};
