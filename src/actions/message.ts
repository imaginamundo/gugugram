"use server";

import { and, eq } from "drizzle-orm";

import { db } from "@/database/postgres";
import { messages } from "@/database/schema";

export async function addMessage(
  authorId: string,
  receiverId: string,
  body: string,
) {
  if (authorId === receiverId) {
    throw new Error("Você não pode mandar mensagem para si");
  }

  await db.insert(messages).values({ authorId, receiverId, body });
}

export async function removeMessage(
  authorId: string,
  receiverId: string,
  messageId: string,
) {
  if (authorId !== receiverId) {
    throw new Error("Essa mensagem nem é sua");
  }

  await db
    .delete(messages)
    .where(
      and(eq(messages.receiverId, receiverId), eq(messages.id, messageId)),
    );
}
