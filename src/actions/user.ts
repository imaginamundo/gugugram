"use server";

import { and, count, eq, ne } from "drizzle-orm";
import { notFound } from "next/navigation";

import { db } from "@/database/postgres";
import type {
  MessageType,
  UserFriendsType,
  UserProfileType,
  UserType,
} from "@/database/schema";
import { messages, userFriends, users } from "@/database/schema";

type DisplayUserType = Pick<UserType, "id" | "username">;
type DisplayProfileType = Pick<UserProfileType, "description" | "image">;
type DisplayProfileSubleType = Pick<UserProfileType, "image">;
type DisplayFriendType = Pick<UserFriendsType, "id" | "status">;
type DisplayMessageType = Pick<MessageType, "id" | "body" | "createdAt">;

export async function profileInformation(username: string) {
  const user = await db.query.users.findFirst({
    where: (user, { eq }) => eq(user.username, username),
    columns: {
      id: true,
      username: true,
    },
    with: {
      profile: {
        columns: {
          image: true,
          description: true,
        },
      },
      images: {
        columns: {
          id: true,
          image: true,
        },
      },
    },
  });

  if (!user) return notFound();

  const [{ messagesCount }] = await db
    .select({
      messagesCount: count(messages.id),
    })
    .from(users)
    .leftJoin(messages, eq(messages.receiverId, user.id))
    .groupBy(messages.id)
    .limit(1);

  const [{ friendsCount }] = await db
    .select({
      friendsCount: count(userFriends.id),
    })
    .from(users)
    .leftJoin(
      userFriends,
      and(
        eq(userFriends.requestUserId, user.id),
        eq(userFriends.targetUserId, user.id),
        eq(userFriends.status, "accepted"),
      ),
    )
    .groupBy(userFriends.id)
    .limit(1);

  return { messagesCount, friendsCount, ...user };
}
export type ProfileInformationType = DisplayUserType & {
  profile: DisplayProfileType;
  messagesCount: number;
  friendsCount: number;
};

export async function profileMessages(username: string) {
  const messages = await db.query.users.findFirst({
    where: (user, { eq }) => eq(user.username, username),
    columns: {},
    with: {
      messages: {
        columns: {
          id: true,
          body: true,
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
export type ProfileMessagesType = (DisplayMessageType & {
  author: DisplayUserType;
})[];

export async function profileFriends(username: string) {
  const friends = await db.query.users.findFirst({
    where: (user, { eq }) => eq(user.username, username),
    columns: {},
    with: {
      friends: {
        where: ne(userFriends.status, "canceled"),
        columns: {
          id: true,
          status: true,
        },
        with: {
          targetUser: {
            columns: {
              id: true,
              username: true,
            },
            with: {
              profile: {
                columns: {
                  image: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (friends) return friends.friends;
  return [];
}
export type ProfileFriendsType = (DisplayFriendType & {
  targetUser: DisplayUserType & { profile: DisplayProfileSubleType };
})[];
