// src/services/user/search.ts
import { friendshipPossibleStatus } from "@schemas/database";
import { parseUser } from "@utils/user";
import { userSearchRepository } from "@repositories/userSearch";

export async function getUsers({
	query,
	session,
}: {
	query: string;
	session?: App.Locals["user"];
}) {
	const sanitizedQuery = query?.trim() || "";

	if (sanitizedQuery === "") {
		return [];
	}

	const currentUserId = session?.id;

	if (currentUserId) {
		const searchResults = await userSearchRepository.searchAuthenticatedUsers(
			sanitizedQuery,
			currentUserId,
		);

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

	const guestSearchResults = await userSearchRepository.searchGuestUsers(sanitizedQuery);

	return guestSearchResults.map((user) => ({
		...parseUser(user),
		friendship: {
			status: null,
			type: null,
		},
	}));
}
