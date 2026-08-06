import { db } from "@infra/database";
import { users } from "@schemas/database";
import { asc, count } from "drizzle-orm";

export const sitemapRepository = {
	countUsers: async () => {
		const result = await db.select({ count: count() }).from(users);
		return result[0].count;
	},

	// Ordered by the primary key so the chunk boundaries stay stable between the
	// requests a crawler makes for consecutive sitemap files.
	getUsernamesPage: async (limit: number, offset: number) => {
		return db
			.select({ username: users.username })
			.from(users)
			.orderBy(asc(users.id))
			.limit(limit)
			.offset(offset);
	},
};
