import { sequence } from "astro:middleware";
import { authentication } from "./_authentication";

export const onRequest = sequence(authentication);
