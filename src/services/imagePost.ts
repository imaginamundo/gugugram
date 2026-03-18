// src/services/imagePost.ts
import sanitizeHtml from "sanitize-html";
import { imageSize } from "image-size";
import { utapi } from "@lib/uploadthing";
import { imagePostRepository } from "@repositories/imagePost.ts";

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

export type PostWithCommentsType = Omit<PostType, "commentsCount"> & {
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
		throw new Error("Imagem muito grande. O tamanho máximo é 60KB.");
	}

	const lastImage = await imagePostRepository.getLatestPostByAuthor(userId);

	if (lastImage) {
		const timeDiff = new Date().getTime() - lastImage.createdAt.getTime();
		if (timeDiff < RATE_LIMIT_MS) {
			const timeLeft = Math.ceil((RATE_LIMIT_MS - timeDiff) / 1000);
			throw new Error(`Aguarde mais ${timeLeft} segundo(s) antes de enviar outra imagem.`);
		}
	}

	const arrayBuffer = await file.arrayBuffer();
	const dimensions = imageSize(Buffer.from(arrayBuffer));

	if (!dimensions || dimensions.width === undefined || dimensions.height === undefined) {
		throw new Error("Arquivo de imagem inválido ou corrompido.");
	}

	const isSquare = dimensions.width === dimensions.height;
	const isAllowedDimension =
		ALLOWED_DIMENSIONS.includes(dimensions.width) && ALLOWED_DIMENSIONS.includes(dimensions.height);

	if (!isSquare || !isAllowedDimension) {
		throw new Error("Tamanho de imagem incompatível.");
	}

	const fileToUpload = new File([arrayBuffer], file.name, { type: file.type });
	const upload = await utapi.uploadFiles(fileToUpload);

	if (!upload.data?.ufsUrl) {
		throw new Error("Erro ao subir a imagem para o servidor.");
	}

	const sanitizedDescription = description ? sanitizeHtml(description) : null;

	try {
		await imagePostRepository.insertPost(userId, upload.data.ufsUrl, sanitizedDescription);
	} catch {
		const imageKey = upload.data.ufsUrl.split("/").pop();
		if (imageKey) await utapi.deleteFiles(imageKey);
		throw new Error("Erro ao salvar no banco de dados. Upload cancelado.");
	}

	return upload.data.ufsUrl;
}

export async function removeImagePost(userId: string, postId: string, imageUrl: string) {
	const imageKey = imageUrl.split("/").pop();
	if (!imageKey) throw new Error("URL de imagem inválida.");

	const deletedRow = await imagePostRepository.deletePost(postId, userId);

	if (deletedRow.length === 0) {
		throw new Error("Imagem não encontrada ou sem permissão para exclusão.");
	}

	await utapi.deleteFiles(imageKey);
}

export async function addImageComment(userId: string, imageId: string, body: string) {
	const lastComment = await imagePostRepository.getLatestCommentByAuthor(userId);

	if (lastComment) {
		const timeDiff = new Date().getTime() - lastComment.createdAt.getTime();
		if (timeDiff < RATE_LIMIT_MS) {
			const timeLeft = Math.ceil((RATE_LIMIT_MS - timeDiff) / 1000);
			throw new Error(
				`Calma lá! Aguarde mais ${timeLeft} segundo(s) para enviar outro comentário.`,
			);
		}
	}

	const sanitizedBody = sanitizeHtml(body);
	if (!sanitizedBody) throw new Error("Comentário inválido.");

	const postExists = await imagePostRepository.getPostById(imageId);
	if (!postExists) throw new Error("Post não encontrado.");

	await imagePostRepository.insertComment(imageId, userId, sanitizedBody);
}

export async function removeImageComment(userId: string, commentId: string) {
	const commentData = await imagePostRepository.getCommentWithPostAuthor(commentId);
	if (!commentData) throw new Error("Comentário não encontrado.");

	const isCommentAuthor = commentData.authorId === userId;
	const isPhotoOwner = commentData.post.authorId === userId;

	if (!isCommentAuthor && !isPhotoOwner) {
		throw new Error("Não autorizado para apagar este comentário.");
	}

	await imagePostRepository.deleteComment(commentId);
}
