import "dotenv/config";
import { defineConfig } from "drizzle-kit";

const POSTGRES_URL = process.env.POSTGRES_URL;

const command = process.argv[2];
const needsDatabase = ["migrate", "studio", "push", "up", "drop", "introspect"].includes(command);

if (!POSTGRES_URL && needsDatabase) {
	throw new Error(
		`POSTGRES_URL is not set — required for \`drizzle-kit ${command}\`. Add it to .env and try again.`,
	);
}

export default defineConfig({
	out: "./drizzle",
	schema: "./src/schemas/database.ts",
	dialect: "postgresql",
	dbCredentials: {
		url: POSTGRES_URL ?? "postgres://invalid",
	},
	tablesFilter: ["gugugram_*"],
});
