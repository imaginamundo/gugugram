import "dotenv/config";
import { defineConfig } from "drizzle-kit";

// drizzle-kit runs outside the Astro runtime, so `astro:env/server` is not
// importable here. Read from `process.env` (populated by `dotenv/config` above)
// instead — same value, same source `.env` file, just resolved natively.
const POSTGRES_URL = process.env.POSTGRES_URL;
if (!POSTGRES_URL) {
	// Allowed to be missing for `drizzle-kit generate` (it diffs schema vs.
	// snapshot, no DB needed). Required for `migrate` / `studio`.
	console.warn("POSTGRES_URL is not set — `migrate` and `studio` will fail.");
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
