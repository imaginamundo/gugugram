export type CommunityType = {
	id: string;
	title: string;
	slug: string;
	description: string | null;
	image: string | null;
	ownerId: string;
	ownerUsername: string;
	postCount: number;
	createdAt: Date;
};

export type CommunityPostType = {
	id: string;
	communityId: string;
	title: string;
	content: string;
	authorId: string;
	authorUsername: string;
	responseCount: number;
	createdAt: Date;
	lastActivity?: Date;
};

export type CommunityPostDetailType = CommunityPostType & {
	responses: CommunityResponseType[];
};

/**
 * A post plus its author's username and nothing else — no aggregate counts and
 * no responses. Used by the paginated detail view, which counts and pages the
 * responses separately instead of loading all of them.
 */
export type CommunityPostWithAuthorType = Omit<CommunityPostType, "responseCount" | "lastActivity">;

export type CommunityResponseType = {
	id: string;
	postId: string;
	content: string;
	authorId: string;
	authorUsername: string;
	createdAt: Date;
};

export type CommunityMembershipType = {
	communityId: string;
	communityTitle: string;
	communitySlug: string;
	communityImage: string | null;
};
