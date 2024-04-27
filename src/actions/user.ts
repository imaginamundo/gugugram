"use server";

import { count, eq } from "drizzle-orm";
import { notFound } from "next/navigation";

import { db } from "@/database/postgres";
import { messages, users } from "@/database/schema";

export async function profileInformation(username: string) {
  const user = await db.query.users.findFirst({
    where: (user, { eq }) => eq(user.username, username),
    columns: {
      id: true,
      username: true,
      profilePicture: true,
      description: true,
    },
    with: {
      images: {
        columns: {
          id: true,
          url: true,
        },
      },
    },
  });

  if (!user) return notFound();

  const [{ messagesCount }] = await db
    .select({
      messagesCount: count(messages.authorId),
    })
    .from(users)
    .leftJoin(messages, eq(messages.authorId, user.id))
    .groupBy(users.id)
    .orderBy(users.username)
    .limit(1);

  const [{ friendsCount }] = await db
    .select({
      friendsCount: count(users.id),
    })
    .from(users)
    .where(eq(users.friends, user.id));

  const groupedUser = { messagesCount, friendsCount, ...user };

  return groupedUser;
}

export async function profileMessages(username: string) {
  const messages = await db.query.users.findFirst({
    where: (user, { eq }) => eq(user.username, username),
    columns: {},
    with: {
      messages: {
        columns: {
          id: true,
          content: true,
          createdAt: true,
        },
        with: {
          author: {
            columns: {
              id: true,
              username: true,
            },
          },
        },
      },
    },
  });

  if (messages) return messages.messages;
  return [];
}

export async function profileFriends(username: string) {
  const friends = await db.query.users.findFirst({
    where: (user, { eq }) => eq(user.username, username),
    columns: {},
    with: {
      friends: {
        columns: {
          id: true,
          username: true,
        },
      },
    },
  });

  if (friends) return friends.friends;
  return [];
}
