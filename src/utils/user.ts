import { getEmojiById } from "@utils/emoji";
import type {
	BaseUser,
	ProfileUser,
	User,
	FriendshipContext,
	FriendsType,
} from "@customTypes/user";

export type { BaseUser, ProfileUser, User, FriendshipContext, FriendsType };

export function parseUser<T extends BaseUser>(user: T): Omit<T, "image"> & { image: string } {
	return {
		...user,
		image: user.image ?? getEmojiById(user.id),
	};
}
