import { POSTGRES_URL } from "astro:env/server";
import * as schema from "@schemas/database";
import { neon } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { drizzle as drizzleNode } from "drizzle-orm/node-postgres";

const isLocal =
	POSTGRES_URL.startsWith("postgresql://localhost") ||
	POSTGRES_URL.startsWith("postgres://localhost");

export const db = isLocal
	? drizzleNode({ connection: POSTGRES_URL, schema })
	: drizzleNeon({ client: neon(POSTGRES_URL), schema });
