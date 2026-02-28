import { and, eq, or, count, sql } from "drizzle-orm";
import { db } from "@database/postgres";
import { users, messages, userFriends, friendshipPossibleStatus } from "@database/schema";
import { getEmojiById } from "@utils/emoji";

interface BaseUser {
	id: string;
	image: string | null;
}
export type ProfileUser = NonNullable<Awaited<ReturnType<typeof getProfile>>["user"]>;
export type User = Omit<ProfileUser, "description">;
export type FriendshipContext = {
	status: (typeof friendshipPossibleStatus)[number] | null;
	type: "target" | "request" | null;
};
export type FriendsType = {
	friends: User[];
	friendRequests: User[];
};

function parseUser<T extends BaseUser>(user: T): Omit<T, "image"> & { image: string } {
	return {
		...user,
		image: user.image ?? getEmojiById(user.id),
	};
}

export async function getProfile({
	username,
	session,
}: {
	username: string;
	session?: App.Locals["user"];
}) {
	const userData = await db.query.users.findFirst({
		where: (user, { eq }) => eq(user.username, username),
		columns: {
			id: true,
			username: true,
			image: true,
			description: true,
		},
	});

	if (!userData) {
		return {
			user: null,
			messagesCount: 0,
			friendsCount: 0,
			pendingFriendRequest: false,
		};
	}

	let friendshipStatus: {
		status: (typeof friendshipPossibleStatus)[number] | null;
		type: "target" | "request" | null;
	} = {
		status: null,
		type: null,
	};

	if (session && session.id !== userData.id) {
		const friendshipData = await db.query.userFriends.findFirst({
			where: (userFriends, { eq, or, and }) =>
				or(
					and(eq(userFriends.targetUserId, session.id), eq(userFriends.requestUserId, userData.id)),
					and(eq(userFriends.targetUserId, userData.id), eq(userFriends.requestUserId, session.id)),
				),
		});

		if (friendshipData) {
			friendshipStatus.status = friendshipData.status;
			friendshipStatus.type = friendshipData.targetUserId === userData.id ? "request" : "target";
		}
	}

	const [{ messagesCount }] = await db
		.select({ messagesCount: count() })
		.from(messages)
		.where(eq(messages.receiverId, userData.id));

	const [{ friendsCount }] = await db
		.select({ friendsCount: count() })
		.from(userFriends)
		.where(
			and(
				eq(userFriends.status, "accepted"),
				or(eq(userFriends.requestUserId, userData.id), eq(userFriends.targetUserId, userData.id)),
			),
		);

	let pendingFriendRequest = false;

	if (session && session.id === userData.id) {
		const friendRequest = await db
			.select()
			.from(userFriends)
			.where(and(eq(userFriends.status, "pending"), eq(userFriends.targetUserId, userData.id)))
			.limit(1);
		pendingFriendRequest = !!friendRequest.length;
	}

	const profileUser = {
		...parseUser(userData),
		friendship: friendshipStatus,
	};

	return {
		user: profileUser,
		messagesCount,
		friendsCount,
		pendingFriendRequest,
	};
}

export async function getFriends(
	userId: string,
	session?: App.Locals["user"],
): Promise<FriendsType> {
	const userWithFriends = await db.query.users.findFirst({
		where: eq(users.id, userId),
		columns: {},
		with: {
			targetedFriends: {
				where: (uf, { inArray }) => inArray(uf.status, ["accepted", "pending"]),
				columns: { status: true },
				with: {
					requestUser: {
						columns: { id: true, username: true, image: true },
					},
				},
			},
			requestedFriends: {
				where: (uf, { eq }) => eq(uf.status, "accepted"),
				columns: { status: true },
				with: {
					targetUser: {
						columns: { id: true, username: true, image: true },
					},
				},
			},
		},
	});

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

export async function getUsers({
	query,
	session,
}: {
	query: string;
	session?: App.Locals["user"];
}) {
	if (!query || query.trim() === "") {
		return [];
	}

	const currentUserId = session?.id;

	if (currentUserId) {
		const searchResults = await db.query.users.findMany({
			where: (user, { ilike, and, ne }) =>
				and(ilike(user.username, `%${query.trim()}%`), ne(user.id, currentUserId)),
			columns: {
				id: true,
				username: true,
				image: true,
			},
			with: {
				targetedFriends: {
					where: (uf, { eq }) => eq(uf.requestUserId, currentUserId),
					columns: { status: true },
				},
				requestedFriends: {
					where: (uf, { eq }) => eq(uf.targetUserId, currentUserId),
					columns: { status: true },
				},
			},
			limit: 20,
		});

		return searchResults.map((user) => {
			let friendshipStatus: (typeof friendshipPossibleStatus)[number] | null = null;
			let friendshipType: "target" | "request" | null = null;

			if (user.targetedFriends.length > 0) {
				friendshipStatus = user.targetedFriends[0].status;
				friendshipType = "request";
			} else if (user.requestedFriends.length > 0) {
				friendshipStatus = user.requestedFriends[0].status;
				friendshipType = "target";
			}

			return {
				...parseUser(user),
				friendship: {
					status: friendshipStatus,
					type: friendshipType,
				},
			};
		});
	}

	const guestSearchResults = await db.query.users.findMany({
		where: (user, { ilike }) => ilike(user.username, `%${query.trim()}%`),
		columns: {
			id: true,
			username: true,
			image: true,
		},
		limit: 20,
	});

	return guestSearchResults.map((user) => ({
		...parseUser(user),
		friendship: {
			status: null,
			type: null,
		},
	}));
}
