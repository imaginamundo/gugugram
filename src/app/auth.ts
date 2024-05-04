import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { eq, or } from "drizzle-orm";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { db } from "@/database/postgres";
import { users } from "@/database/schema";
import { isPasswordValid } from "@/utils/password";

import { loginSchema } from "./entrar/types";

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt" },
  adapter: DrizzleAdapter(db),
  providers: [
    CredentialsProvider({
      id: "credentials",
      credentials: {
        identity: {},
        password: {},
      },
      authorize: async (credentials) => {
        let user = null;

        let { identity, password } = await loginSchema.validate(credentials);

        identity = identity.toLowerCase();
        password = password.toLowerCase();

        user = await db.query.users.findFirst({
          where: or(eq(users.email, identity), eq(users.username, identity)),
          with: {
            profile: {
              columns: {
                image: true,
              },
            },
          },
        });
        if (!user) throw new Error("Usuário não encontrado");

        const validPassword = isPasswordValid(user.password, password);
        if (!validPassword) throw new Error("Senha inválida");

        return user;
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.image = user?.profile?.image || "";
      }
      return token;
    },
    session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id as string,
          username: token.username as string,
          image: token.image as string,
        },
      };
    },
  },
  pages: {
    signIn: "/entrar",
  },
});
