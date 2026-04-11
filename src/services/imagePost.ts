import sanitizeHtml from "sanitize-html";
import { imageSize } from "image-size";
import { storage } from "@infra/storage";
import { imagePostRepository } from "@repositories/imagePost.ts";
import { ImagePostErrors } from "@customTypes/errors";
import { checkRateLimit } from "@utils/rate-limit";

export type CommentType = {
	id: string;
	body: string;
	createdAt: Date;
	authorId: string;
	authorUsername: string;
};

export type PostType = {
	id: string;
	image: string;
	description: string | null;
	commentsCount: number;
	userId: string;
	username: string;
	createdAt: Date;
};

export type PostWithCommentsType = PostType & {
	comments: CommentType[];
};

const RATE_LIMIT_MS = 5000;
const ALLOWED_DIMENSIONS = [5, 10, 15, 30, 60];

export async function getLatestImagePosts(): Promise<PostType[]> {
	const posts = await imagePostRepository.getLatestPosts();
	return posts.map((item) => ({
		id: item.id,
		image: item.image,
		description: item.description,
		commentsCount: item.commentsCount,
		userId: item.author.id,
		username: item.author.username,
		createdAt: item.createdAt,
	}));
}

export async function getImagePosts(username: string): Promise<PostType[]> {
	const user = await imagePostRepository.getPostsByUsername(username);

	if (!user || !user.imagePosts) return [];

	return user.imagePosts.map((img) => ({
		id: img.id,
		image: img.image,
		description: img.description,
		commentsCount: img.commentsCount,
		userId: user.id,
		username: user.username,
		createdAt: img.createdAt,
	}));
}

export async function getImagePost(id: string): Promise<PostWithCommentsType | null> {
	const post = await imagePostRepository.getPostWithCommentsById(id);
	if (!post) return null;

	return {
		id: post.id,
		image: post.image,
		description: post.description,
		commentsCount: post.comments.length,
		userId: post.author.id,
		username: post.author.username,
		createdAt: post.createdAt,
		comments: post.comments.map((comment) => ({
			id: comment.id,
			body: comment.body,
			createdAt: comment.createdAt,
			authorId: comment.author.id,
			authorUsername: comment.author.username,
		})),
	};
}

export async function getImagePostComments(postId: string): Promise<CommentType[]> {
	const comments = await imagePostRepository.getCommentsByPostId(postId);
	return comments.map((comment) => ({
		id: comment.id,
		body: comment.body,
		createdAt: comment.createdAt,
		authorId: comment.author.id,
		authorUsername: comment.author.username,
	}));
}

export async function processAndUploadImagePost(userId: string, file: File, description?: string) {
	if (file.size > 60000) {
		throw new Error(ImagePostErrors.FILE_TOO_LARGE);
	}

	const lastImage = await imagePostRepository.getLatestPostByAuthor(userId);
	checkRateLimit(lastImage?.createdAt, RATE_LIMIT_MS, "Aguarde mais");

	const arrayBuffer = await file.arrayBuffer();
	const dimensions = imageSize(Buffer.from(arrayBuffer));

	if (!dimensions || dimensions.width === undefined || dimensions.height === undefined) {
		throw new Error(ImagePostErrors.INVALID_IMAGE_FILE);
	}

	const isSquare = dimensions.width === dimensions.height;
	const isAllowedDimension =
		ALLOWED_DIMENSIONS.includes(dimensions.width) && ALLOWED_DIMENSIONS.includes(dimensions.height);

	if (!isSquare || !isAllowedDimension) {
		throw new Error(ImagePostErrors.INVALID_IMAGE_DIMENSIONS);
	}

	const fileToUpload = new File([arrayBuffer], file.name, { type: file.type });
	const upload = await storage.upload(fileToUpload);

	if (!upload.data?.ufsUrl) {
		throw new Error(ImagePostErrors.UPLOAD_FAILED);
	}

	const sanitizedDescription = description ? sanitizeHtml(description, { allowedTags: [] }) : null;

	try {
		await imagePostRepository.insertPost(userId, upload.data.ufsUrl, sanitizedDescription);
	} catch {
		const imageKey = upload.data.ufsUrl.split("/").pop();
		if (imageKey) await storage.delete(imageKey);
		throw new Error(ImagePostErrors.DB_INSERT_FAILED);
	}

	return upload.data.ufsUrl;
}

export async function removeImagePost(userId: string, postId: string, imageUrl: string) {
	const imageKey = imageUrl.split("/").pop();
	if (!imageKey) throw new Error(ImagePostErrors.INVALID_IMAGE_URL);

	const deletedRow = await imagePostRepository.deletePost(postId, userId);

	if (deletedRow.length === 0) {
		throw new Error(ImagePostErrors.POST_NOT_FOUND_OR_FORBIDDEN);
	}

	await storage.delete(imageKey);
}

export async function addImageComment(userId: string, imageId: string, body: string) {
	const lastComment = await imagePostRepository.getLatestCommentByAuthor(userId);
	checkRateLimit(lastComment?.createdAt, RATE_LIMIT_MS, "Calma lá! Aguarde mais");

	const sanitizedBody = sanitizeHtml(body, { allowedTags: [] });
	if (!sanitizedBody) throw new Error(ImagePostErrors.COMMENT_INVALID);

	const postExists = await imagePostRepository.getPostById(imageId);
	if (!postExists) throw new Error(ImagePostErrors.POST_NOT_FOUND);

	await imagePostRepository.insertComment(imageId, userId, sanitizedBody);
}

export async function removeImageComment(userId: string, commentId: string) {
	const commentData = await imagePostRepository.getCommentWithPostAuthor(commentId);
	if (!commentData) throw new Error(ImagePostErrors.COMMENT_NOT_FOUND);

	const isCommentAuthor = commentData.authorId === userId;
	const isPhotoOwner = commentData.post.authorId === userId;

	if (!isCommentAuthor && !isPhotoOwner) {
		throw new Error(ImagePostErrors.COMMENT_NOT_AUTHORIZED);
	}

	await imagePostRepository.deleteComment(commentId);
}
