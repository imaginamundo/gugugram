import { db } from "@lib/database";
import { and, eq, desc, sql } from "drizzle-orm";
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
			orderBy: desc(imagePosts.createdAt),
			limit,
		});
	},

	getPostsByUsername: async (username: string) => {
		return db.query.users.findFirst({
			where: (user, { eq }) => eq(user.username, username),
			columns: { id: true, username: true },
			with: {
				imagePosts: {
					orderBy: [desc(imagePosts.createdAt)],
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

	getPostWithCommentsById: async (id: string) => {
		return db.query.imagePosts.findFirst({
			where: eq(imagePosts.id, id),
			with: {
				author: { columns: { id: true, username: true } },
				comments: {
					orderBy: (comments, { desc }) => [desc(comments.createdAt)],
					with: { author: { columns: { id: true, username: true } } },
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
	getCommentsByPostId: async (postId: string) => {
		return db.query.imagePostComments.findMany({
			where: eq(imagePostComments.imageId, postId),
			orderBy: [desc(imagePostComments.createdAt)],
			with: { author: { columns: { id: true, username: true } } },
		});
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
