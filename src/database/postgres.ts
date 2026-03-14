import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "./schema";

const client = neon(import.meta.env.POSTGRES_URL!);
export const db = drizzle({ client, schema });
