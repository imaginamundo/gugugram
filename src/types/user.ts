export interface BaseUser {
	id: string;
	image: string | null;
}

export type FriendshipContext = {
	status: "pending" | "accepted" | null;
	type: "target" | "request" | null;
};

export type User = {
	id: string;
	username: string;
	displayUsername: string;
	image: string;
	friendship: FriendshipContext;
};

export type ProfileUser = User & {
	email: string;
	description: string | null;
	lastCheckedMessagesAt: Date | null;
};

export type FriendsType = {
	friends: User[];
	friendRequests: User[];
};
