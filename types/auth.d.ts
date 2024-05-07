import NextAuth, {
  type DefaultSession,
  type JWT as DefaultJWT,
  type User as DefaultUser,
} from "next-auth";

declare module "next-auth" {
  interface User extends DefaultUser {
    id: string;
    username: string;
    profile: {
      image: string | null;
    };
  }

  interface Session extends DefaultSession {
    user: {
      id: string;
      username: string;
      image: string;
    };
  }
}
