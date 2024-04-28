"use server";

import { auth } from "@/app/auth";
import { db } from "@/database/postgres";
import { userProfiles } from "@/database/schema";

export async function updateDescription(userId: string, description: string) {
  const session = await auth();
  if (session?.user.id !== userId) {
    throw new Error("Você não pode alterar a descrição de outra pessoa");
  }

  db.insert(userProfiles).values({ userId, description }).onConflictDoUpdate({
    target: userProfiles.id,
    set: { description },
  });
}

export async function updateProfileImage(userId: string, image: any) {
  const session = await auth();
  if (session?.user.id !== userId) {
    throw new Error("Você não pode alterar a imagem de perfil de outra pessoa");
  }
}

export async function removeProfileImage(userId: string) {
  const session = await auth();
  if (session?.user.id !== userId) {
    throw new Error("Você não pode remover a imagem de perfil de outra pessoa");
  }
  db.insert(userProfiles)
    .values({ userId, description: "" })
    .onConflictDoUpdate({
      target: userProfiles.id,
      set: { image: "" },
    });
}
