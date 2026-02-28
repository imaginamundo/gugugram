import { createPool } from "@vercel/postgres";
import { drizzle } from "drizzle-orm/vercel-postgres";

import * as schema from "./schema";

export const db = drizzle(
  createPool({
    connectionString: import.meta.env.POSTGRES_URL,
  }),
  { schema },
);
