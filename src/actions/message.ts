"use server";

import { and, eq } from "drizzle-orm";

import { auth } from "@/app/auth";
import { db } from "@/database/postgres";
import { messages } from "@/database/schema";

export async function addMessage(receiverId: string, body: string) {
  const session = await auth();
  if (!session) throw new Error("Não autenticado");

  const authorId = session.user.id;
  if (authorId === receiverId) {
    throw new Error("Não pode mandar mensagem para si");
  }

  await db.insert(messages).values({ authorId, receiverId, body });
}

export async function removeMessage(receiverId: string, messageId: string) {
  const session = await auth();
  if (!session) throw new Error("Não autenticado");

  const authorId = session.user.id;

  if (authorId !== receiverId) throw new Error("Não autorizado");

  await db
    .delete(messages)
    .where(
      and(eq(messages.receiverId, receiverId), eq(messages.id, messageId)),
    );
}
