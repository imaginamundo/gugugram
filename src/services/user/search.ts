import { friendshipPossibleStatus } from "@schemas/database";
import { parseUser } from "@utils/user";
import { userSearchRepository } from "@repositories/userSearch";

const PAGE_SIZE = 20;

export async function getUsers({
	query,
	session,
	page = 1,
}: {
	query: string;
	session?: App.Locals["user"];
	page?: number;
}) {
	const sanitizedQuery = query?.trim() || "";

	if (sanitizedQuery === "") {
		return {
			items: [],
			pagination: { page: 1, totalPages: 1 },
		};
	}

	const currentUserId = session?.id;

	const [totalCount, searchResults] = await Promise.all([
		userSearchRepository.countUsers(sanitizedQuery, currentUserId),
		currentUserId
			? userSearchRepository.searchAuthenticatedUsers(sanitizedQuery, currentUserId, page)
			: userSearchRepository.searchGuestUsers(sanitizedQuery, page),
	]);

	const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

	const items = searchResults.map((user) => {
		let friendshipStatus: (typeof friendshipPossibleStatus)[number] | null = null;
		let friendshipType: "target" | "request" | null = null;

		if (currentUserId && "targetedFriends" in user) {
			const authedUser = user as typeof user & {
				targetedFriends: { status: (typeof friendshipPossibleStatus)[number] }[];
				requestedFriends: { status: (typeof friendshipPossibleStatus)[number] }[];
			};
			if (authedUser.targetedFriends.length > 0) {
				friendshipStatus = authedUser.targetedFriends[0].status;
				friendshipType = "request";
			} else if (authedUser.requestedFriends.length > 0) {
				friendshipStatus = authedUser.requestedFriends[0].status;
				friendshipType = "target";
			}
		}

		return {
			...parseUser(user),
			friendship: { status: friendshipStatus, type: friendshipType },
		};
	});

	return {
		items,
		pagination: {
			page,
			totalPages,
		},
	};
}
