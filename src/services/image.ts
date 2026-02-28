import { desc } from "drizzle-orm";
import { db } from "@database/postgres";
import { images } from "@database/schema";

export type PostType = {
	id: string;
	image: string;
	userId: string;
	username: string;
	createdAt: Date;
};

const formatPostType = (item: any): PostType => ({
	id: item.id,
	image: item.image,
	userId: item.author.id,
	username: item.author.username,
	createdAt: item.createdAt,
});

export function getLatestPosts() {
	return db.query.images
		.findMany({
			columns: {
				id: true,
				image: true,
				createdAt: true,
			},
			with: {
				author: { columns: { id: true, username: true } },
			},
			orderBy: desc(images.createdAt),
			limit: 120,
		})
		.then((result) => {
			return result.map(formatPostType);
		});
}

export async function getImagePosts(username: string) {
	const imagePostsData = await db.query.users
		.findFirst({
			where: (user, { eq }) => eq(user.username, username),
			columns: {
				id: true,
				name: true,
			},
			with: {
				images: {
					orderBy: [desc(images.createdAt)],
					columns: {
						id: true,
						image: true,
						createdAt: true,
					},
					with: {
						author: {
							columns: {
								id: true,
								username: true,
							},
						},
					},
				},
			},
		})
		.then((user) => {
			if (!user) {
				return [];
			}

			return user.images.map(formatPostType);
		});

	if (!imagePostsData) return [];

	return imagePostsData;
}
