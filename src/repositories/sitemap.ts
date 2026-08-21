import { db } from "@infra/database";
import { communities, imagePosts, users } from "@schemas/database";
import { asc, count, desc, eq } from "drizzle-orm";
import { descNullsLast } from "@utils/order";

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

	getCommunitySlugs: async (limit: number) => {
		return db
			.select({ slug: communities.slug })
			.from(communities)
			.orderBy(desc(communities.createdAt))
			.limit(limit);
	},

	getPosts: async (limit: number) => {
		return db
			.select({ id: imagePosts.id, username: users.username })
			.from(imagePosts)
			.innerJoin(users, eq(imagePosts.authorId, users.id))
			.orderBy(descNullsLast(imagePosts.createdAt))
			.limit(limit);
	},
};
