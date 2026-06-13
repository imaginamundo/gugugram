import sanitizeHtml from "sanitize-html";
import { communityRepository } from "@repositories/community";
import { slugify } from "@utils/slugify";
import { CommunityErrors } from "@customTypes/errors";
import { checkImage, uploadImage } from "@services/uploadImage/uploadImage";
import type {
	CommunityType,
	CommunityPostType,
	CommunityPostDetailType,
	CommunityMembershipType,
} from "@customTypes/community";

const PAGE_SIZE = 20;

function sanitize(text: string): string {
	return sanitizeHtml(text, { allowedTags: [] });
}

export async function getCommunities(page: number): Promise<CommunityType[]> {
	return communityRepository.getCommunities(page, PAGE_SIZE);
}

export async function getCommunity(slug: string): Promise<CommunityType | null> {
	const community = await communityRepository.getCommunityBySlug(slug);
	return community ?? null;
}

export async function createCommunity(
	ownerId: string,
	title: string,
	description: string | null,
	imageFile: string | null,
): Promise<{ id: string; slug: string }> {
	if (title.length < 3) throw new Error(CommunityErrors.TITLE_TOO_SHORT);
	if (title.length > 100) throw new Error(CommunityErrors.TITLE_TOO_LONG);
	if (description && description.length > 500)
		throw new Error(CommunityErrors.DESCRIPTION_TOO_LONG);

	const slug = slugify(title);
	const existing = await communityRepository.getCommunityBySlug(slug);
	if (existing) throw new Error(CommunityErrors.TITLE_ALREADY_EXISTS);

	const sanitizedTitle = sanitize(title);
	const sanitizedDescription = description ? sanitize(description) : null;

	let imageUrl: string | null = null;
	if (imageFile && imageFile.includes(",")) {
		const base64Data = imageFile.replace(/^data:image\/\w+;base64,/, "");
		const buffer = Buffer.from(base64Data, "base64");
		const originalName = slug || "community";
		const newFilename = `${originalName}_30x30.png`;
		const file = new File([buffer], newFilename, { type: "image/png" });

		await checkImage(file);

		imageUrl = await uploadImage(file);
	}

	const id = crypto.randomUUID();
	await communityRepository.insertCommunity(
		ownerId,
		sanitizedTitle,
		slug,
		sanitizedDescription,
		imageUrl,
	);

	const created = await communityRepository.getCommunityBySlug(slug);
	const communityId = created?.id ?? id;

	await communityRepository.insertSubscriber(communityId, ownerId);

	return { id: communityId, slug };
}

export async function removeCommunity(requesterId: string, communityId: string): Promise<void> {
	const deleted = await communityRepository.deleteCommunity(communityId, requesterId);
	if (deleted.length === 0) throw new Error(CommunityErrors.NOT_OWNER);
}

// --- ADMINS ---

export async function promoteToAdmin(
	ownerId: string,
	communityId: string,
	targetUserId: string,
): Promise<void> {
	const community = await communityRepository.getCommunityById(communityId);
	if (!community) throw new Error(CommunityErrors.NOT_FOUND);
	if (community.ownerId !== ownerId) throw new Error(CommunityErrors.NOT_OWNER);

	const existing = await communityRepository.getAdmin(communityId, targetUserId);
	if (existing) throw new Error(CommunityErrors.ALREADY_ADMIN);

	await communityRepository.insertAdmin(communityId, targetUserId);
}

export async function removeAdmin(
	ownerId: string,
	communityId: string,
	targetUserId: string,
): Promise<void> {
	const community = await communityRepository.getCommunityById(communityId);
	if (!community) throw new Error(CommunityErrors.NOT_FOUND);
	if (community.ownerId !== ownerId) throw new Error(CommunityErrors.NOT_OWNER);

	const existing = await communityRepository.getAdmin(communityId, targetUserId);
	if (!existing) throw new Error(CommunityErrors.NOT_ADMIN);

	await communityRepository.deleteAdmin(communityId, targetUserId);
}

export async function transferOwnership(
	ownerId: string,
	communityId: string,
	newOwnerId: string,
): Promise<void> {
	const community = await communityRepository.getCommunityById(communityId);
	if (!community) throw new Error(CommunityErrors.NOT_FOUND);
	if (community.ownerId !== ownerId) throw new Error(CommunityErrors.NOT_OWNER);

	const targetAdmin = await communityRepository.getAdmin(communityId, newOwnerId);
	if (!targetAdmin) throw new Error(CommunityErrors.TRANSFER_TARGET_NOT_ADMIN);

	await communityRepository.updateCommunityOwner(communityId, newOwnerId);
	await communityRepository.deleteAdmin(communityId, newOwnerId);

	// Ensure old owner remains a subscriber
	const oldOwnerSubscriber = await communityRepository.getSubscriber(communityId, ownerId);
	if (!oldOwnerSubscriber) {
		await communityRepository.insertSubscriber(communityId, ownerId);
	}
}

export async function subscribeToCommunity(userId: string, communityId: string): Promise<void> {
	const community = await communityRepository.getCommunityById(communityId);
	if (!community) throw new Error(CommunityErrors.NOT_FOUND);

	const existing = await communityRepository.getSubscriber(communityId, userId);
	if (existing) throw new Error(CommunityErrors.ALREADY_SUBSCRIBER);

	await communityRepository.insertSubscriber(communityId, userId);
}

export async function unsubscribeFromCommunity(userId: string, communityId: string): Promise<void> {
	const community = await communityRepository.getCommunityById(communityId);
	if (!community) throw new Error(CommunityErrors.NOT_FOUND);

	const existing = await communityRepository.getSubscriber(communityId, userId);
	if (!existing) throw new Error(CommunityErrors.NOT_SUBSCRIBER);

	await communityRepository.deleteSubscriber(communityId, userId);
}

export async function getUserSubscriptions(userId: string): Promise<CommunityMembershipType[]> {
	return communityRepository.getSubscribersByUser(userId);
}

export async function getSubscriber(communityId: string, userId: string): Promise<boolean> {
	const subscriber = await communityRepository.getSubscriber(communityId, userId);
	return !!subscriber;
}

export async function getCommunityAdmins(
	communityId: string,
): Promise<{ id: string; username: string }[]> {
	const rows = await communityRepository.getAdminsByCommunity(communityId);
	return rows.map((a) => ({ id: a.userId, username: a.user.username }));
}

export async function getCommunityPosts(
	communityId: string,
	page: number,
): Promise<CommunityPostType[]> {
	return communityRepository.getPostsByCommunity(communityId, page, PAGE_SIZE);
}

export async function getCommunityPost(postId: string): Promise<CommunityPostDetailType | null> {
	const post = await communityRepository.getPostWithResponses(postId);
	return post ?? null;
}

export async function createPost(
	userId: string,
	communityId: string,
	title: string,
	content: string,
): Promise<{ id: string }> {
	const community = await communityRepository.getCommunityById(communityId);
	if (!community) throw new Error(CommunityErrors.NOT_FOUND);

	const subscriber = await communityRepository.getSubscriber(communityId, userId);
	if (!subscriber) throw new Error(CommunityErrors.NOT_SUBSCRIBER);

	if (title.length < 3) throw new Error(CommunityErrors.POST_TITLE_TOO_SHORT);
	if (title.length > 150) throw new Error(CommunityErrors.POST_TITLE_TOO_LONG);
	if (content.length < 1 || content.length > 5000)
		throw new Error(CommunityErrors.POST_CONTENT_INVALID);

	const sanitizedTitle = sanitize(title);
	const sanitizedContent = sanitize(content);

	await communityRepository.insertPost(communityId, userId, sanitizedTitle, sanitizedContent);

	const posts = await communityRepository.getPostsByCommunity(communityId, 1, 1);
	return { id: posts[0]?.id ?? "" };
}

export async function removePost(requesterId: string, postId: string): Promise<void> {
	const post = await communityRepository.getPostById(postId);
	if (!post) throw new Error(CommunityErrors.POST_NOT_FOUND);

	const isAuthor = post.authorId === requesterId;
	if (isAuthor) {
		await communityRepository.deletePost(postId, requesterId);
		return;
	}

	const community = await communityRepository.getCommunityById(post.communityId);
	if (!community) throw new Error(CommunityErrors.NOT_FOUND);

	const isOwner = community.ownerId === requesterId;
	const isAdmin = isOwner
		? false
		: !!(await communityRepository.getAdmin(post.communityId, requesterId));

	if (!isOwner && !isAdmin) throw new Error(CommunityErrors.POST_NOT_AUTHORIZED);

	await communityRepository.deletePostAsModerator(postId, post.communityId);
}

export async function createResponse(
	userId: string,
	postId: string,
	content: string,
): Promise<void> {
	const post = await communityRepository.getPostById(postId);
	if (!post) throw new Error(CommunityErrors.POST_NOT_FOUND);

	const subscriber = await communityRepository.getSubscriber(post.communityId, userId);
	if (!subscriber) throw new Error(CommunityErrors.NOT_SUBSCRIBER);

	if (content.length < 1 || content.length > 2000)
		throw new Error(CommunityErrors.RESPONSE_CONTENT_INVALID);

	const sanitizedContent = sanitize(content);
	await communityRepository.insertResponse(postId, userId, sanitizedContent);
}

export async function removeResponse(requesterId: string, responseId: string): Promise<void> {
	const response = await communityRepository.getResponseById(responseId);
	if (!response) throw new Error(CommunityErrors.RESPONSE_NOT_FOUND);

	const isAuthor = response.authorId === requesterId;
	if (isAuthor) {
		await communityRepository.deleteResponse(responseId, requesterId);
		return;
	}

	// Check if moderator (owner or admin)
	const post = await communityRepository.getPostById(response.postId);
	if (!post) throw new Error(CommunityErrors.POST_NOT_FOUND);

	const community = await communityRepository.getCommunityById(post.communityId);
	if (!community) throw new Error(CommunityErrors.NOT_FOUND);

	const isOwner = community.ownerId === requesterId;
	const isAdmin = isOwner
		? false
		: !!(await communityRepository.getAdmin(post.communityId, requesterId));

	if (!isOwner && !isAdmin) throw new Error(CommunityErrors.RESPONSE_NOT_AUTHORIZED);

	await communityRepository.deleteResponseAsModerator(responseId, post.communityId);
}
