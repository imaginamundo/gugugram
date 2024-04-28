"use server";

import { auth } from "@/app/auth";
import { db } from "@/database/postgres";
import { userProfiles } from "@/database/schema";

export async function updateDescription(userId: string, description: string) {
  const session = await auth();
  if (!session) {
    throw new Error("Não autenticado");
  }
  const currentUserId = session.user.id;
  if (currentUserId !== userId) throw new Error("Alteração não autorizada");

  db.insert(userProfiles).values({ userId, description }).onConflictDoUpdate({
    target: userProfiles.id,
    set: { description },
  });
}

export async function updateProfileImage(userId: string, image: any) {
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
