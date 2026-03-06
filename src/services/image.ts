import { desc, eq } from "drizzle-orm";
import { db } from "@database/postgres";
import { imagePosts } from "@database/schema";

export type PostType = {
	id: string;
	image: string;
	description: string | null;
	userId: string;
	username: string;
	createdAt: Date;
};

export function getLatestImagePosts(): Promise<PostType[]> {
	return db.query.imagePosts
		.findMany({
			columns: {
				id: true,
				image: true,
				description: true,
				createdAt: true,
			},
			with: {
				author: { columns: { id: true, username: true } },
			},
			orderBy: desc(imagePosts.createdAt),
			limit: 120,
		})
		.then((result) => {
			return result.map((item) => {
				return {
					id: item.id,
					image: item.image,
					description: item.description,
					userId: item.author.id,
					username: item.author.username,
					createdAt: item.createdAt,
				};
			});
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
			imagePosts: {
				orderBy: [desc(imagePosts.createdAt)],
				columns: {
					id: true,
					image: true,
					description: true,
					createdAt: true,
				},
			},
		},
	});

	if (!user || !user.imagePosts) {
		return [];
	}

	return user.imagePosts.map((img) => ({
		id: img.id,
		image: img.image,
		description: img.description,
		userId: user.id,
		username: user.username,
		createdAt: img.createdAt,
	}));
}

export async function getImagePost(id: string): Promise<PostType | null> {
	const post = await db.query.imagePosts.findFirst({
		where: eq(imagePosts.id, id),
		with: {
			author: {
				columns: { id: true, username: true },
			},
		},
	});

	if (!post) return null;

	return {
		id: post.id,
		image: post.image,
		description: post.description,
		userId: post.author.id,
		username: post.author.username,
		createdAt: post.createdAt,
	};
}
