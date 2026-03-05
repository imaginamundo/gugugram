import { desc, eq } from "drizzle-orm";
import { db } from "@database/postgres";
import { images } from "@database/schema";

export type PostType = {
	id: string;
	image: string;
	description: string | null;
	userId: string;
	username: string;
	createdAt: Date;
};

export function getLatestPosts(): Promise<PostType[]> {
	return db.query.images
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
			orderBy: desc(images.createdAt),
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
			images: {
				orderBy: [desc(images.createdAt)],
				columns: {
					id: true,
					image: true,
					description: true,
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
		description: img.description,
		userId: user.id,
		username: user.username,
		createdAt: img.createdAt,
	}));
}

export async function getImagePost(id: string): Promise<PostType | null> {
	const postRecord = await db.query.images.findFirst({
		where: eq(images.id, id),
		with: {
			author: {
				columns: { id: true, username: true },
			},
		},
	});

	if (!postRecord) return null;

	return {
		id: postRecord.id,
		image: postRecord.image,
		description: postRecord.description,
		userId: postRecord.author.id,
		username: postRecord.author.username,
		createdAt: postRecord.createdAt,
	};
}
