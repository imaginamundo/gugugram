import { sequence } from "astro:middleware";
import { authentication } from "./_authentication";
import { checkOrigin } from "./_checkOrigin";
import { protectedRoutes } from "./_protectedRoutes";

export const onRequest = sequence(checkOrigin, authentication, protectedRoutes);
