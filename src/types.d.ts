import { DefaultSession } from "@auth/core/types";

type UserType = {
  id: string;
  username: string;
  image?: string;
};

declare module "@auth/core/types" {
  interface User extends DefaultUser, UserType {}

  interface Session extends DefaultSession, UserType {}
}

declare namespace App {
  interface Locals {
    user?: UserType;
  }
}
