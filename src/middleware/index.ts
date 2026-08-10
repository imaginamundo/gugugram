import { sequence } from "astro:middleware";
import { securityHeaders } from "@middleware/_securityHeaders";
import { authentication } from "@middleware/_authentication";
import { checkOrigin } from "@middleware/_checkOrigin";
import { protectedRoutes } from "@middleware/_protectedRoutes";

export const onRequest = sequence(securityHeaders, checkOrigin, authentication, protectedRoutes);
