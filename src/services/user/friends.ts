import { parseUser } from "@utils/user";
import type { User, FriendsType, FriendshipContext } from "@utils/user";
import { userFriendsRepository } from "@repositories/userFriends";

export async function getFriends(
	userId: string,
	session?: App.Locals["user"],
): Promise<FriendsType> {
	const userWithFriends = await userFriendsRepository.getUserWithFriendships(userId);

	if (!userWithFriends) {
		return { friends: [], friendRequests: [] };
	}

	const friends: User[] = [];
	const friendRequests: User[] = [];

	const isOwner = session?.id === userId;

	for (const friend of userWithFriends.targetedFriends) {
		const friendshipContext: FriendshipContext = { status: friend.status, type: "target" };
		const user = parseUser(friend.requestUser);

		if (friend.status === "accepted") {
			friends.push({ ...user, friendship: friendshipContext });
		} else if (isOwner) {
			friendRequests.push({ ...user, friendship: friendshipContext });
		}
	}

	for (const friend of userWithFriends.requestedFriends) {
		friends.push({
			...parseUser(friend.targetUser),
			friendship: { status: friend.status, type: "request" },
		});
	}

	return { friends, friendRequests };
}

export async function processFriendRequest(requesterId: string, targetId: string) {
	if (requesterId === targetId) {
		throw new Error("INVALID_ACTION");
	}

	const existingReverseRequest = await userFriendsRepository.getReverseRequest(
		requesterId,
		targetId,
	);

	if (existingReverseRequest) {
		await userFriendsRepository.acceptRequestById(existingReverseRequest.id);
		return "accepted";
	}

	await userFriendsRepository.createPendingRequest(requesterId, targetId);
	return "pending";
}

export async function acceptPendingFriendRequest(requesterId: string, targetId: string) {
	await userFriendsRepository.acceptRequestByUsers(requesterId, targetId);
}

export async function deleteFriendship(userId1: string, userId2: string) {
	await userFriendsRepository.deleteFriendshipBetweenUsers(userId1, userId2);
}
