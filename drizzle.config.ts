import { type Config } from "drizzle-kit";

if (!process.env.POSTGRES_URL) {
  throw new Error("No postgress POSTGRES_URL environment variable");
}

export default {
  schema: "./src/database/schema.ts",
  driver: "pg",
  dbCredentials: {
    connectionString: process.env.POSTGRES_URL,
  },
  tablesFilter: ["gugugram_*"],
} satisfies Config;
