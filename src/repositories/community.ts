import { db } from "@infra/database";
import { and, eq, desc, sql } from "drizzle-orm";
import {
	communities,
	communityAdmins,
	communitySubscribers,
	communityPosts,
	communityResponses,
	users,
} from "@schemas/database";
import type {
	CommunityType,
	CommunityPostType,
	CommunityPostDetailType,
	CommunityResponseType,
	CommunityMembershipType,
} from "@customTypes/community";

const postCountSubquery =
	sql<number>`(SELECT count(*) FROM ${communityPosts} AS p WHERE p.community_id = ${communities.id})`
		.mapWith(Number)
		.as("postCount");

const responseCountSubquery =
	sql<number>`(SELECT count(*) FROM ${communityResponses} AS r WHERE r.post_id = ${communityPosts.id})`
		.mapWith(Number)
		.as("responseCount");

export const communityRepository = {
	getCommunities: async (page: number, limit: number): Promise<CommunityType[]> => {
		const offset = (page - 1) * limit;
		const rows = await db
			.select({
				id: communities.id,
				title: communities.title,
				slug: communities.slug,
				description: communities.description,
				image: communities.image,
				ownerId: communities.ownerId,
				ownerUsername: users.username,
				postCount: postCountSubquery,
				createdAt: communities.createdAt,
			})
			.from(communities)
			.innerJoin(users, eq(communities.ownerId, users.id))
			.orderBy(desc(communities.createdAt))
			.limit(limit)
			.offset(offset);
		return rows;
	},

	getCommunityById: async (id: string): Promise<CommunityType | undefined> => {
		const rows = await db
			.select({
				id: communities.id,
				title: communities.title,
				slug: communities.slug,
				description: communities.description,
				image: communities.image,
				ownerId: communities.ownerId,
				ownerUsername: users.username,
				postCount: postCountSubquery,
				createdAt: communities.createdAt,
			})
			.from(communities)
			.innerJoin(users, eq(communities.ownerId, users.id))
			.where(eq(communities.id, id))
			.limit(1);
		return rows[0];
	},

	getCommunityBySlug: async (slug: string): Promise<CommunityType | undefined> => {
		const rows = await db
			.select({
				id: communities.id,
				title: communities.title,
				slug: communities.slug,
				description: communities.description,
				image: communities.image,
				ownerId: communities.ownerId,
				ownerUsername: users.username,
				postCount: postCountSubquery,
				createdAt: communities.createdAt,
			})
			.from(communities)
			.innerJoin(users, eq(communities.ownerId, users.id))
			.where(eq(communities.slug, slug))
			.limit(1);
		return rows[0];
	},

	insertCommunity: async (
		ownerId: string,
		title: string,
		slug: string,
		description: string | null,
		image: string | null,
	) => {
		return db.insert(communities).values({ ownerId, title, slug, description, image });
	},

	deleteCommunity: async (communityId: string, ownerId: string) => {
		return db
			.delete(communities)
			.where(and(eq(communities.id, communityId), eq(communities.ownerId, ownerId)))
			.returning();
	},

	updateCommunity: async (
		communityId: string,
		description: string | null,
		imageUrl: string | null,
	): Promise<CommunityType> => {
		const rows = await db
			.update(communities)
			.set({ description, image: imageUrl })
			.where(eq(communities.id, communityId))
			.returning();
		return rows[0] as CommunityType;
	},

	updateCommunityOwner: async (communityId: string, newOwnerId: string) => {
		return db
			.update(communities)
			.set({ ownerId: newOwnerId })
			.where(eq(communities.id, communityId));
	},

	// --- ADMINS ---

	getAdmin: async (communityId: string, userId: string) => {
		return db.query.communityAdmins.findFirst({
			where: and(eq(communityAdmins.communityId, communityId), eq(communityAdmins.userId, userId)),
		});
	},

	getAdminsByCommunity: async (communityId: string) => {
		return db.query.communityAdmins.findMany({
			where: eq(communityAdmins.communityId, communityId),
			with: { user: { columns: { id: true, username: true } } },
		});
	},

	insertAdmin: async (communityId: string, userId: string) => {
		return db.insert(communityAdmins).values({ communityId, userId });
	},

	deleteAdmin: async (communityId: string, userId: string) => {
		return db
			.delete(communityAdmins)
			.where(and(eq(communityAdmins.communityId, communityId), eq(communityAdmins.userId, userId)));
	},

	getSubscriber: async (communityId: string, userId: string) => {
		return db.query.communitySubscribers.findFirst({
			where: and(
				eq(communitySubscribers.communityId, communityId),
				eq(communitySubscribers.userId, userId),
			),
		});
	},

	getSubscribersByUser: async (userId: string): Promise<CommunityMembershipType[]> => {
		const rows = await db
			.select({
				communityId: communitySubscribers.communityId,
				communityTitle: communities.title,
				communitySlug: communities.slug,
				communityImage: communities.image,
			})
			.from(communitySubscribers)
			.innerJoin(communities, eq(communitySubscribers.communityId, communities.id))
			.where(eq(communitySubscribers.userId, userId));
		return rows;
	},

	insertSubscriber: async (communityId: string, userId: string) => {
		return db.insert(communitySubscribers).values({ communityId, userId });
	},

	deleteSubscriber: async (communityId: string, userId: string) => {
		return db
			.delete(communitySubscribers)
			.where(
				and(
					eq(communitySubscribers.communityId, communityId),
					eq(communitySubscribers.userId, userId),
				),
			);
	},

	getLatestResponseByAuthor: async (postId: string, authorId: string) => {
		return db.query.communityResponses.findFirst({
			where: and(eq(communityResponses.postId, postId), eq(communityResponses.authorId, authorId)),
			orderBy: [desc(communityResponses.createdAt)],
		});
	},

	getPostsByCommunity: async (
		communityId: string,
		page: number,
		limit: number,
	): Promise<CommunityPostType[]> => {
		const offset = (page - 1) * limit;
		const rows = await db
			.select({
				id: communityPosts.id,
				communityId: communityPosts.communityId,
				title: communityPosts.title,
				content: communityPosts.content,
				authorId: communityPosts.authorId,
				authorUsername: users.username,
				responseCount: responseCountSubquery,
				createdAt: communityPosts.createdAt,
			})
			.from(communityPosts)
			.innerJoin(users, eq(communityPosts.authorId, users.id))
			.where(eq(communityPosts.communityId, communityId))
			.orderBy(desc(communityPosts.createdAt))
			.limit(limit)
			.offset(offset);
		return rows;
	},

	getPostById: async (postId: string) => {
		return db.query.communityPosts.findFirst({
			where: eq(communityPosts.id, postId),
		});
	},

	getPostWithResponses: async (postId: string): Promise<CommunityPostDetailType | undefined> => {
		const row = await db.query.communityPosts.findFirst({
			where: eq(communityPosts.id, postId),
			with: {
				author: { columns: { id: true, username: true } },
				responses: {
					orderBy: [communityResponses.createdAt],
					with: { author: { columns: { id: true, username: true } } },
				},
			},
		});

		if (!row) return undefined;

		const responses: CommunityResponseType[] = row.responses.map((r) => ({
			id: r.id,
			postId: r.postId,
			content: r.content,
			authorId: r.authorId,
			authorUsername: r.author.username,
			createdAt: r.createdAt,
		}));

		return {
			id: row.id,
			communityId: row.communityId,
			title: row.title,
			content: row.content,
			authorId: row.authorId,
			authorUsername: row.author.username,
			responseCount: responses.length,
			createdAt: row.createdAt,
			responses,
		};
	},

	insertPost: async (communityId: string, authorId: string, title: string, content: string) => {
		return db.insert(communityPosts).values({ communityId, authorId, title, content });
	},

	deletePost: async (postId: string, authorId: string) => {
		return db
			.delete(communityPosts)
			.where(and(eq(communityPosts.id, postId), eq(communityPosts.authorId, authorId)))
			.returning();
	},

	deletePostAsModerator: async (postId: string, communityId: string) => {
		return db
			.delete(communityPosts)
			.where(and(eq(communityPosts.id, postId), eq(communityPosts.communityId, communityId)))
			.returning();
	},

	getResponsesByPost: async (postId: string) => {
		return db.query.communityResponses.findMany({
			where: eq(communityResponses.postId, postId),
			orderBy: [communityResponses.createdAt],
			with: { author: { columns: { id: true, username: true } } },
		});
	},

	getResponseById: async (responseId: string) => {
		return db.query.communityResponses.findFirst({
			where: eq(communityResponses.id, responseId),
		});
	},

	insertResponse: async (postId: string, authorId: string, content: string) => {
		return db.insert(communityResponses).values({ postId, authorId, content });
	},

	deleteResponse: async (responseId: string, authorId: string) => {
		return db
			.delete(communityResponses)
			.where(and(eq(communityResponses.id, responseId), eq(communityResponses.authorId, authorId)))
			.returning();
	},

	deleteResponseAsModerator: async (responseId: string, communityId: string) => {
		// Verify the response belongs to a post in the moderator's community
		const response = await db.query.communityResponses.findFirst({
			where: eq(communityResponses.id, responseId),
			with: { post: { columns: { communityId: true } } },
		});

		if (!response || response.post.communityId !== communityId) {
			return [];
		}

		return db.delete(communityResponses).where(eq(communityResponses.id, responseId)).returning();
	},
};
