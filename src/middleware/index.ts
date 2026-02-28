import { sequence } from "astro:middleware";
import { authentication } from "./_authentication";
import { checkOrigin } from "./_checkOrigin";

export const onRequest = sequence(checkOrigin, authentication);
