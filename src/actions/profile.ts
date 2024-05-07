"use server";

import { eq, or } from "drizzle-orm";
import { sanitize } from "isomorphic-dompurify";
import { notFound } from "next/navigation";

import { auth } from "@/app/auth";
import { db } from "@/database/postgres";
import {
  images,
  messages,
  userFriends,
  userProfiles,
  users,
} from "@/database/schema";
import { utapi } from "@/image-upload/uploadthing";

import { logoutAction } from "./authentication";
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
  if (!session) return { message: "Não permitido" };

  let image = (data.get("image") || "") as string;
  image = sanitize(image);

  const file = data.get("file") as Blob | undefined;
  let upload;
  if (file) {
    try {
      if (!file) return { message: "Nenhuma imagem selecionada" };
      if (file.size > 10000) return { message: "Imagem muito grande" };

      upload = await utapi.uploadFiles(file);
    } catch (e) {
      throw e;
    }
  }

  if (upload?.data?.url) image = upload.data.url;

  const profileId = data.get("profileId") || undefined;

  let description = (data.get("description") || "") as string;
  description = sanitize(description);

  await db
    .insert(userProfiles)
    .values({ id: profileId, userId: session.user.id, image, description })
    .onConflictDoUpdate({
      target: [userProfiles.id, userProfiles.userId],
      set: { image, description },
    });

  return { image };
}
export type EditProfileInformationType = {
  userId: string;
  profileId?: string;
  image?: string;
  // username: string;
  description: string;
};

export async function deleteProfileImage() {
  const session = await auth();

  if (!session) return { message: "Não permitido" };
  if (!session.user.image) return { message: "Nenhuma imagem" };

  let imageId = session.user.image.split("/").pop();

  await utapi.deleteFiles(imageId!);

  await db
    .update(userProfiles)
    .set({ image: "" })
    .where(eq(userProfiles.userId, session.user.id));
}

export async function deleteAccount() {
  const session = await auth();

  if (!session) return { message: "Não permitido" };

  let imageId;
  if (session.user.image) {
    imageId = session.user.image.split("/").pop();
  }

  await db.delete(users).where(eq(users.id, session.user.id));

  await db
    .delete(userFriends)
    .where(
      or(
        eq(userFriends.requestUserId, session.user.id),
        eq(userFriends.targetUserId, session.user.id),
      ),
    );

  await db
    .delete(messages)
    .where(
      or(
        eq(messages.authorId, session.user.id),
        eq(messages.receiverId, session.user.id),
      ),
    );

  const deletedImages = await db
    .delete(images)
    .where(eq(images.authorId, session.user.id))
    .returning({ image: images.image });

  const imagesToDelete = deletedImages.map(
    ({ image }) => image.split("/").pop() as string,
  );
  if (imageId) imagesToDelete.push(imageId!);

  await db.delete(userProfiles).where(eq(userProfiles.userId, session.user.id));

  await utapi.deleteFiles(imagesToDelete);

  await logoutAction();
}
