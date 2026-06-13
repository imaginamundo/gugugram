import { storage } from "@infra/storage";
import { parseUser } from "@utils/user";
import { userProfileRepository, type UpdateUserPayload } from "@repositories/userProfile";
import { friendshipPossibleStatus } from "@schemas/database";
import { ProfileErrors } from "@customTypes/errors";
import { checkImage, uploadImage } from "@services/uploadImage/uploadImage";

type UpdateProfileData = {
	username: string;
	email: string;
	description?: string;
	profileImage?: string; // Base64 string
};

export async function getProfile({
	username,
	session,
}: {
	username: string;
	session?: App.Locals["user"];
}) {
	const userData = await userProfileRepository.getUserByUsername(username);

	if (!userData) {
		return {
			user: null,
			messagesCount: 0,
			friendsCount: 0,
			pendingFriendRequest: 0,
		};
	}

	const friendshipStatus: {
		status: (typeof friendshipPossibleStatus)[number] | null;
		type: "target" | "request" | null;
	} = {
		status: null,
		type: null,
	};

	const isOwnProfile = !!session && session.id === userData.id;

	// These queries are independent of each other, so run them in a single
	// round-trip instead of awaiting one after another. The friendship lookup
	// only matters when viewing someone else's profile, and the pending/unread
	// counts only matter when viewing your own — the others resolve to a no-op.
	const [friendsCount, messagesCount, friendshipData, pendingFriendRequest, unreadMessagesCount] =
		await Promise.all([
			userProfileRepository.getAcceptedFriendsCount(userData.id),
			userProfileRepository.getTotalMessagesCount(userData.id),
			session && session.id !== userData.id
				? userProfileRepository.getFriendshipBetweenUsers(session.id, userData.id)
				: Promise.resolve(null),
			isOwnProfile
				? userProfileRepository.getPendingRequestsCount(userData.id)
				: Promise.resolve(0),
			isOwnProfile
				? userProfileRepository.getUnreadMessagesCount(userData.id, userData.lastCheckedMessagesAt)
				: Promise.resolve(0),
		]);

	if (friendshipData) {
		friendshipStatus.status = friendshipData.status;
		friendshipStatus.type = friendshipData.targetUserId === userData.id ? "request" : "target";
	}

	const profileUser = {
		...parseUser(userData),
		friendship: friendshipStatus,
	};

	return {
		user: profileUser,
		messagesCount,
		unreadMessagesCount,
		friendsCount,
		pendingFriendRequest,
	};
}

export async function updateProfileData(userId: string, data: UpdateProfileData) {
	const currentUser = await userProfileRepository.getUserById(userId);
	if (!currentUser) throw new Error(ProfileErrors.USER_NOT_FOUND);

	const updateData: UpdateUserPayload = {
		description: data.description,
		username: data.username,
		displayUsername: data.username,
		email: data.email,
	};

	let oldImageKeyToDelete: string | null = null;

	if (data.profileImage && data.profileImage.includes(",")) {
		try {
			const base64Data = data.profileImage.replace(/^data:image\/\w+;base64,/, "");
			const buffer = Buffer.from(base64Data, "base64");

			const originalName = data.username || "avatar";
			const newFilename = `${originalName}_30x30.png`;
			const file = new File([buffer], newFilename, { type: "image/png" });

			await checkImage(file);

			const uploadedImageUrl = await uploadImage(file);

			updateData.image = uploadedImageUrl;

			if (currentUser.image) {
				oldImageKeyToDelete = currentUser.image.split("/").pop() || null;
			}
		} catch (e) {
			if (e instanceof Error && e.message === ProfileErrors.IMAGE_UPLOAD_FAILED) throw e;
			throw new Error(ProfileErrors.IMAGE_PROCESSING_FAILED);
		}
	}

	try {
		await userProfileRepository.updateUser(userId, updateData);

		if (oldImageKeyToDelete) {
			storage
				.delete(oldImageKeyToDelete)
				.catch((e) => console.error("Erro ao deletar imagem antiga do UT:", e));
		}
	} catch (error) {
		const dbError = error as { code?: string };
		if (dbError.code === "23505") {
			throw new Error(ProfileErrors.UNIQUE_CONSTRAINT_VIOLATION);
		}
		throw new Error(ProfileErrors.DB_UPDATE_FAILED);
	}
}

export async function removeProfileImageFromUser(userId: string) {
	const currentUser = await userProfileRepository.getUserById(userId);

	if (!currentUser?.image) {
		throw new Error(ProfileErrors.NO_IMAGE_TO_REMOVE);
	}

	const imageKey = currentUser.image.split("/").pop();

	try {
		if (imageKey) {
			await storage.delete(imageKey);
		}
		await userProfileRepository.updateUser(userId, { image: null });
	} catch {
		throw new Error(ProfileErrors.DB_UPDATE_FAILED);
	}
}
