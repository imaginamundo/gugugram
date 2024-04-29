"use server";

import { notFound } from "next/navigation";

import { auth } from "@/app/auth";
import { db } from "@/database/postgres";
import { userProfiles } from "@/database/schema";

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

export async function updateProfile({
  userId,
  profileId,
  image,
  // username,
  description,
}: EditProfileInformationType) {
  const session = await auth();
  if (!session) {
    throw new Error("Não autenticado");
  }

  if (userId !== session.user.id) throw new Error("Não autorizado");

  await db
    .insert(userProfiles)
    .values({ id: profileId, userId, image: "", description })
    .onConflictDoUpdate({
      target: userProfiles.id,
      set: { description },
    });
}
export type EditProfileInformationType = {
  userId: string;
  profileId?: string;
  image?: string;
  // username: string;
  description: string;
};

export async function updateProfileImage(userId: string) {
  const session = await auth();
  if (session?.user.id !== userId) throw new Error("Remoção não autorizada");
}

export async function removeProfileImage(userId: string) {
  const session = await auth();
  if (session?.user.id !== userId) throw new Error("Alteração não autorizada");

  db.insert(userProfiles)
    .values({ userId, description: "" })
    .onConflictDoUpdate({
      target: userProfiles.id,
      set: { image: "" },
    });
}
