"user server";

import { auth } from "@/app/auth";
import { db } from "@/database/postgres";
import { userFriends } from "@/database/schema";

export const addFriend = async (targetUserId: string) => {
  const session = await auth();
  if (!session) throw new Error("Não autenticado");

  const requestUserId = session.user.id;
  if (requestUserId === targetUserId) throw new Error("Não autorizado");

  await db
    .insert(userFriends)
    .values({ requestUserId, targetUserId, status: "pending" })
    .onConflictDoUpdate({
      target: [userFriends.requestUserId, userFriends.targetUserId],
      set: { status: "pending" },
    });
};

export const removeFriend = async (targetUserId: string) => {
  const session = await auth();
  if (!session) throw new Error("Não autenticado");

  const requestUserId = session.user.id;
  if (requestUserId === targetUserId) throw new Error("Não autorizado");

  await db
    .insert(userFriends)
    .values({ requestUserId, targetUserId, status: "canceled" })
    .onConflictDoUpdate({
      target: [userFriends.requestUserId, userFriends.targetUserId],
      set: { status: "canceled" },
    });
};
