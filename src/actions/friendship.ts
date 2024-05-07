"use server";

import { and, eq, or } from "drizzle-orm";

import { auth } from "@/app/auth";
import { db } from "@/database/postgres";
import { userFriends } from "@/database/schema";

export const addFriend = async (targetUserId: string) => {
  const session = await auth();
  if (!session) return { message: "Não autenticado" };

  // Todo: If user already has send a friend request and other user do it at the same time

  const requestUserId = session.user.id;
  if (requestUserId === targetUserId) return { message: "Não autorizado" };

  await db
    .insert(userFriends)
    .values({ requestUserId, targetUserId, status: "pending" })
    .onConflictDoUpdate({
      target: [userFriends.requestUserId, userFriends.targetUserId],
      set: { status: "pending" },
    });
};

export const acceptFriend = async (requestUserId: string) => {
  const session = await auth();
  if (!session) return { message: "Não autenticado" };

  const targetUserId = session.user.id;
  if (requestUserId === targetUserId) return { message: "Não autorizado" };

  await db
    .insert(userFriends)
    .values({ requestUserId, targetUserId, status: "accepted" })
    .onConflictDoUpdate({
      target: [userFriends.requestUserId, userFriends.targetUserId],
      set: { status: "accepted" },
    });
};

export const removeFriend = async (targetUserId: string) => {
  const session = await auth();
  if (!session) throw new Error("Não autenticado");

  const requestUserId = session.user.id;
  if (requestUserId === targetUserId) return { message: "Não autorizado" };

  await db
    .delete(userFriends)
    .where(
      or(
        and(
          eq(userFriends.requestUserId, requestUserId),
          eq(userFriends.targetUserId, targetUserId),
        ),
        and(
          eq(userFriends.targetUserId, requestUserId),
          eq(userFriends.requestUserId, targetUserId),
        ),
      ),
    );
};
