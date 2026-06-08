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
};

export type CommunityPostDetailType = CommunityPostType & {
	responses: CommunityResponseType[];
};

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
