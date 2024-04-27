import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { eq } from "drizzle-orm";
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
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        let user = null;

        const { email, password } = await loginSchema.validate(credentials);

        user = await db.query.users.findFirst({
          where: eq(users.email, email),
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
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id;
      session.user.username = token.username;
      return session;
    },
  },
  pages: {
    signIn: "/entrar",
  },
});
