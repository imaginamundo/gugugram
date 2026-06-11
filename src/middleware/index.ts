import { sequence } from "astro:middleware";
import { authentication } from "@middleware/_authentication";
import { checkOrigin } from "@middleware/_checkOrigin";
import { protectedRoutes } from "@middleware/_protectedRoutes";

export const onRequest = sequence(checkOrigin, authentication, protectedRoutes);
