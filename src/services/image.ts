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

export async function getImagePosts(username: string): Promise<PostType[]> {
	const user = await db.query.users.findFirst({
		where: (user, { eq }) => eq(user.username, username),
		columns: {
			id: true,
			username: true,
		},
		with: {
			images: {
				orderBy: [desc(images.createdAt)],
				columns: {
					id: true,
					image: true,
					createdAt: true,
				},
			},
		},
	});

	if (!user || !user.images) {
		return [];
	}

	return user.images.map((img) => ({
		id: img.id,
		image: img.image,
		userId: user.id,
		username: user.username,
		createdAt: img.createdAt,
	}));
}
