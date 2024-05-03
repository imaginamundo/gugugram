import NextAuth, {
  type DefaultSession,
  type User as DefaultUser,
} from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    username: string;
    profile: {
      image: string | null;
    };
  }

  interface Session {
    user: {
      id: string;
      username: string;
      image: string;
    } & DefaultSession["user"];
  }
}
// import NextAuth, { type DefaultSession } from "next-auth";

// declare module "next-auth" {
//   interface Session {
//     user: {
//       id: string;
//       username: string;
//       profile: {
//         image: string;
//       };
//     } & DefaultSession["user"];
//   }
// }
