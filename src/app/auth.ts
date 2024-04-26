import { DrizzleAdapter } from "@auth/drizzle-adapter";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { db } from "@/database/postgres";
import { users } from "@/database/schema";

import { loginSchema } from "./entrar/types";

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt" },
  adapter: DrizzleAdapter(db),
  providers: [
    CredentialsProvider({
      id: "credentials",
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        let user = null;

        const { email, password } = await loginSchema.validate(credentials);

        user = await db.query.users.findFirst({
          where: eq(users.email, email),
        });

        if (!user || !(await bcrypt.compare(password, user.password!))) {
          return null;
        }

        return user;
      },
    }),
  ],
  callbacks: {},
  pages: {
    signIn: "/entrar",
  },
});
