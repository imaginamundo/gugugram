"user server";

import { db } from "@/database/postgres";
import { userFriends } from "@/database/schema";

export const addFriend = async (
  requestUserId: string,
  targetUserId: string,
) => {
  if (requestUserId === targetUserId) {
    throw new Error("Você não pode se adicionar");
  }
  await db
    .insert(userFriends)
    .values({ requestUserId, targetUserId, status: "pending" })
    .onConflictDoUpdate({
      target: [userFriends.requestUserId, userFriends.targetUserId],
      set: { status: "pending" },
    });
};

export const removeFriend = async (
  requestUserId: string,
  targetUserId: string,
) => {
  if (requestUserId === targetUserId) {
    throw new Error("Você não pode se remover");
  }
  await db
    .insert(userFriends)
    .values({ requestUserId, targetUserId, status: "canceled" })
    .onConflictDoUpdate({
      target: [userFriends.requestUserId, userFriends.targetUserId],
      set: { status: "canceled" },
    });
};
