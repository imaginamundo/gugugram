import { type Config } from "drizzle-kit";

if (!process.env.POSTGRES_URL) throw new Error("No postgress url");

export default {
  schema: "./src/database/schema.ts",
  driver: "pg",
  dbCredentials: {
    connectionString: process.env.POSTGRES_URL,
  },
  tablesFilter: ["gugugram_*"],
} satisfies Config;
