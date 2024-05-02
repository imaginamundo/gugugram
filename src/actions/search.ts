"use server";

import { sanitize } from "isomorphic-dompurify";

import { db } from "@/database/postgres";

import type { DisplayUserType } from "./user";

export async function searchUsers(query: string) {
  const sanitizedQuery = sanitize(query).toLowerCase();
  return await db.query.users.findMany({
    where: (user, { ilike }) => ilike(user.username, `%${sanitizedQuery}%`),
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
