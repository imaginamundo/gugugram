import { getEmojiById } from "@utils/emoji";
import { friendshipPossibleStatus } from "@schemas/database";
import { getProfile } from "@services/user/profile.ts";

export interface BaseUser {
	id: string;
	image: string | null;
}
export type ProfileUser = NonNullable<Awaited<ReturnType<typeof getProfile>>["user"]>;
export type User = Omit<ProfileUser, "description" | "lastCheckedMessagesAt">;
export type FriendshipContext = {
	status: (typeof friendshipPossibleStatus)[number] | null;
	type: "target" | "request" | null;
};
export type FriendsType = {
	friends: User[];
	friendRequests: User[];
};

export function parseUser<T extends BaseUser>(user: T): Omit<T, "image"> & { image: string } {
	return {
		...user,
		image: user.image ?? getEmojiById(user.id),
	};
}
