"use server";

import { db } from "@/database/postgres";

import type { DisplayUserType } from "./user";

export async function searchUsers(query: string) {
  return await db.query.users.findMany({
    where: (user, { eq }) => eq(user.username, query),
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
  });
}
export type UserInformationType = DisplayUserType & {
  profile?: { image: string };
};
