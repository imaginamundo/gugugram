"use server";

import { and, eq } from "drizzle-orm";
import { sanitize } from "isomorphic-dompurify";

import { auth } from "@/app/auth";
import { db } from "@/database/postgres";
import { messages } from "@/database/schema";

export async function addMessage(receiverId: string, body: string) {
  let sanitizedBody = sanitize(body);

  if (!sanitizedBody || sanitizedBody.length > 1000) {
    return { message: "Mensagem com um tamanho inesperado" };
  }

  const session = await auth();
  if (!session) return { message: "Não autenticado" };

  const authorId = session.user.id;
  if (authorId === receiverId) {
    return { message: "Não pode enviar mensagem proce mesmo" };
  }

  await db
    .insert(messages)
    .values({ authorId, receiverId, body: sanitizedBody });
}

export async function removeMessage(messageId: string) {
  const session = await auth();
  if (!session) return { message: "Não autenticado" };

  const authorId = session.user.id;

  await db
    .delete(messages)
    .where(and(eq(messages.receiverId, authorId), eq(messages.id, messageId)));
}
