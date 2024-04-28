import NextAuth, { type DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
      profile: {
        image: string;
      };
    } & DefaultSession["user"];
  }
}
