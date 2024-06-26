"use server";

import { and, count, desc, eq, or } from "drizzle-orm";
import { notFound } from "next/navigation";

import { auth } from "@/app/auth";
import { db } from "@/database/postgres";
import type {
  ImageType,
  MessageType,
  UserFriendsType,
  UserProfileType,
  UserType,
} from "@/database/schema";
import {
  friendshipPossibleStatus,
  images,
  messages as messagesSchema,
  userFriends,
} from "@/database/schema";

export async function userInformations(username: string) {
  const session = await auth();

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
        orderBy: [desc(images.createdAt)],
        columns: {
          id: true,
          image: true,
        },
      },
    },
  });

  if (!user) return notFound();

  let friendshipStatus: {
    status: (typeof friendshipPossibleStatus)[number] | null;
    type: "target" | "request" | null;
  } = {
    status: null,
    type: null,
  };

  if (session && session.user.id !== user.id) {
    const friendship = await db.query.userFriends.findFirst({
      where: (userFriends, { eq, or, and }) =>
        or(
          and(
            eq(userFriends.targetUserId, session.user.id),
            eq(userFriends.requestUserId, user.id),
          ),
          and(
            eq(userFriends.targetUserId, user.id),
            eq(userFriends.requestUserId, session.user.id),
          ),
        ),
    });

    if (friendship) {
      friendshipStatus.status = friendship.status;
      friendshipStatus.type =
        friendship.targetUserId === user.id ? "request" : "target";
    }
  }

  const [{ messagesCount }] = await db
    .select({ messagesCount: count() })
    .from(messagesSchema)
    .where(eq(messagesSchema.receiverId, user.id));

  const [{ friendsCount }] = await db
    .select({ friendsCount: count() })
    .from(userFriends)
    .where(
      and(
        eq(userFriends.status, "accepted"),
        or(
          eq(userFriends.requestUserId, user.id),
          eq(userFriends.targetUserId, user.id),
        ),
      ),
    );

  let pendingFriendRequest = false;

  if (session && session.user.id === user.id) {
    const friendRequest = await db
      .select()
      .from(userFriends)
      .where(
        and(
          eq(userFriends.status, "pending"),
          eq(userFriends.targetUserId, user.id),
        ),
      )
      .limit(1);
    pendingFriendRequest = !!friendRequest.length;
  }

  return {
    friendship: friendshipStatus,
    pendingFriendRequest,
    messagesCount,
    friendsCount,
    ...user,
  };
}
export type UserInformationType = DisplayUserType & {
  profile?: DisplayProfileSubleType;
  images: DisplayImageType[];
  pendingFriendRequest: boolean;
  messagesCount: number;
  friendsCount: number;
  friendship: {
    status: (typeof friendshipPossibleStatus)[number] | null;
    type: "target" | "request" | null;
  };
};

export async function profileMessages(username: string) {
  const messages = await db.query.users.findFirst({
    where: (user, { eq }) => eq(user.username, username),
    columns: {},
    with: {
      messages: {
        orderBy: [desc(messagesSchema.createdAt)],
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

  if (messages) return messages.messages;
  return [];
}
export type ProfileMessagesType = (DisplayMessageType & {
  author: { profile: DisplayProfileImage } & DisplayUserType;
})[];

export async function profileFriends(username: string, userId: string) {
  const friends = await db.query.users.findFirst({
    where: (user, { eq }) => eq(user.username, username),
    columns: {},
    with: {
      targetedFriends: {
        where: or(
          eq(userFriends.requestUserId, userId),
          eq(userFriends.targetUserId, userId),
        ),
        columns: {
          id: true,
          status: true,
        },
        with: {
          requestUser: {
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
      requestedFriends: {
        where: or(
          eq(userFriends.requestUserId, userId),
          eq(userFriends.targetUserId, userId),
        ),
        columns: {
          id: true,
          status: true,
        },
        with: {
          requestUser: {
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

  if (!friends) return { friends: [], friendRequests: [] };

  const friendsMapped: ProfileFriendsType = {
    friends: [],
    friendRequests: [],
  };

  friends.targetedFriends.forEach(({ status, requestUser }) => {
    if (status === "accepted") {
      return friendsMapped.friends.push(buildFriendObject(requestUser));
    }
    if (status === "pending") {
      return friendsMapped.friendRequests.push(buildFriendObject(requestUser));
    }
  });

  friends.requestedFriends.forEach(({ status, targetUser }) => {
    if (status === "accepted") {
      friendsMapped.friends.push(buildFriendObject(targetUser));
    }
  });

  return friendsMapped;
}
export type ProfileFriendsType = {
  friends: FriendType[];
  friendRequests: FriendType[];
};
export type FriendType = DisplayUserType & { profile: DisplayProfileImage };

const buildFriendObject = (user: ProfileFriendsType["friends"][number]) => {
  let profile: DisplayProfileImage = { image: null };
  if (user.profile) profile = user.profile;
  return {
    id: user.id,
    username: user.username,
    profile,
  };
};

export type DisplayUserType = Pick<UserType, "id" | "username">;
export type DisplayProfileType = Pick<
  UserProfileType,
  "id" | "description" | "image"
>;
export type DisplayProfileSubleType = Pick<
  UserProfileType,
  "description" | "image"
>;
export type DisplayProfileImage = Pick<UserProfileType, "image">;
export type DisplayFriendType = Pick<UserFriendsType, "id" | "status">;
export type DisplayImageType = Pick<ImageType, "id" | "image">;
export type DisplayMessageType = Pick<MessageType, "id" | "body" | "createdAt">;
