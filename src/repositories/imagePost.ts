import { db } from "@infra/database";
import { and, count, eq, desc, sql } from "drizzle-orm";
import { descNullsLast } from "@utils/order";
import { imagePosts, imagePostComments } from "@schemas/database";

const commentsCountExtra = {
	commentsCount:
		sql<number>`(SELECT count(*) FROM ${imagePostComments} AS c WHERE c.image_id = ${imagePosts.id})`
			.mapWith(Number)
			.as("commentsCount"),
};

export const imagePostRepository = {
	// --- POST QUERIES ---
	getLatestPosts: async (limit = 120) => {
		return db.query.imagePosts.findMany({
			columns: { id: true, image: true, description: true, createdAt: true },
			with: { author: { columns: { id: true, username: true } } },
			extras: commentsCountExtra,
			orderBy: descNullsLast(imagePosts.createdAt),
			limit,
		});
	},

	getPostsByUsername: async (username: string) => {
		return db.query.users.findFirst({
			where: (user, { eq }) => eq(user.username, username),
			columns: { id: true, username: true },
			with: {
				imagePosts: {
					orderBy: [descNullsLast(imagePosts.createdAt)],
					columns: { id: true, image: true, description: true, createdAt: true },
					extras: commentsCountExtra,
				},
			},
		});
	},

	getPostById: async (id: string) => {
		return db.query.imagePosts.findFirst({
			where: eq(imagePosts.id, id),
			columns: { id: true },
		});
	},

	getPostForOg: async (id: string) => {
		return db.query.imagePosts.findFirst({
			where: eq(imagePosts.id, id),
			columns: { image: true },
			with: { author: { columns: { username: true } } },
		});
	},

	// Only the first page of comments is server-rendered; the rest is fetched by
	// `/api/post/[postId]/comments`. `commentsCount` comes from a count subquery
	// rather than from `comments.length`, which now stops at the page size.
	getPostWithCommentsById: async (id: string, commentsLimit: number) => {
		return db.query.imagePosts.findFirst({
			where: eq(imagePosts.id, id),
			extras: commentsCountExtra,
			with: {
				author: { columns: { id: true, username: true } },
				comments: {
					orderBy: [descNullsLast(imagePostComments.createdAt)],
					with: { author: { columns: { id: true, username: true } } },
					limit: commentsLimit,
				},
			},
		});
	},

	getLatestPostByAuthor: async (authorId: string) => {
		return db.query.imagePosts.findFirst({
			where: eq(imagePosts.authorId, authorId),
			orderBy: [desc(imagePosts.createdAt)],
		});
	},

	// Used by account deletion. The post rows cascade away with the user, but we
	// need their ids (to purge moderation reports that target them) and image
	// urls (to delete the orphaned blobs from storage) BEFORE the cascade runs.
	getPostsByAuthor: async (authorId: string) => {
		return db.query.imagePosts.findMany({
			where: eq(imagePosts.authorId, authorId),
			columns: { id: true, image: true },
		});
	},

	getCommentIdsByAuthor: async (authorId: string): Promise<string[]> => {
		const rows = await db.query.imagePostComments.findMany({
			where: eq(imagePostComments.authorId, authorId),
			columns: { id: true },
		});
		return rows.map((row) => row.id);
	},

	insertPost: async (authorId: string, image: string, description: string | null) => {
		return db.insert(imagePosts).values({ authorId, description, image });
	},

	deletePost: async (postId: string, authorId: string) => {
		return db
			.delete(imagePosts)
			.where(and(eq(imagePosts.id, postId), eq(imagePosts.authorId, authorId)))
			.returning();
	},

	// --- COMMENT QUERIES ---
	getCommentsByPostId: async (postId: string, limit: number, offset: number) => {
		return db.query.imagePostComments.findMany({
			where: eq(imagePostComments.imageId, postId),
			orderBy: [descNullsLast(imagePostComments.createdAt)],
			with: { author: { columns: { id: true, username: true } } },
			limit,
			offset,
		});
	},

	countCommentsByPostId: async (postId: string) => {
		const result = await db
			.select({ count: count() })
			.from(imagePostComments)
			.where(eq(imagePostComments.imageId, postId));
		return result[0].count;
	},

	getLatestCommentByAuthor: async (authorId: string) => {
		return db.query.imagePostComments.findFirst({
			where: eq(imagePostComments.authorId, authorId),
			orderBy: [desc(imagePostComments.createdAt)],
		});
	},

	getCommentWithPostAuthor: async (commentId: string) => {
		return db.query.imagePostComments.findFirst({
			where: eq(imagePostComments.id, commentId),
			with: { post: { columns: { authorId: true } } },
		});
	},

	insertComment: async (imageId: string, authorId: string, body: string) => {
		return db.insert(imagePostComments).values({ imageId, authorId, body });
	},

	deleteComment: async (commentId: string) => {
		return db.delete(imagePostComments).where(eq(imagePostComments.id, commentId));
	},
};
