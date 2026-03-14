import "dotenv/config";
import { defineConfig } from "drizzle-kit";
import { POSTGRES_URL } from "astro:env/server";

export default defineConfig({
	out: "./drizzle",
	schema: "./src/database/schema.ts",
	dialect: "postgresql",
	dbCredentials: {
		url: POSTGRES_URL,
	},
	tablesFilter: ["gugugram_*"],
});
