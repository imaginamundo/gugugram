import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
	out: "./drizzle",
	schema: "./src/schemas/database.ts",
	dialect: "postgresql",
	dbCredentials: {
		url: process.env.POSTGRES_URL!,
	},
	tablesFilter: ["gugugram_*"],
});
