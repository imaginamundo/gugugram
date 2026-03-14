import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { POSTGRES_URL } from "astro:env/server";
import * as schema from "@schemas/database";

const client = neon(POSTGRES_URL);
export const db = drizzle({ client, schema });
