import { storage } from "@infra/storage";
import { parseUser } from "@utils/user";
import { userProfileRepository, type UpdateUserPayload } from "@repositories/userProfile";
import { friendshipPossibleStatus } from "@schemas/database";
import { ProfileErrors } from "@customTypes/errors";

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

	if (session && session.id !== userData.id) {
		const friendshipData = await userProfileRepository.getFriendshipBetweenUsers(
			session.id,
			userData.id,
		);

		if (friendshipData) {
			friendshipStatus.status = friendshipData.status;
			friendshipStatus.type = friendshipData.targetUserId === userData.id ? "request" : "target";
		}
	}

	const friendsCount = await userProfileRepository.getAcceptedFriendsCount(userData.id);
	const messagesCount = await userProfileRepository.getTotalMessagesCount(userData.id);

	let pendingFriendRequest = 0;
	let unreadMessagesCount = 0;

	if (session && session.id === userData.id) {
		pendingFriendRequest = await userProfileRepository.getPendingRequestsCount(userData.id);
		unreadMessagesCount = await userProfileRepository.getUnreadMessagesCount(
			userData.id,
			userData.lastCheckedMessagesAt,
		);
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

			const upload = await storage.upload(file);

			if (!upload.data?.ufsUrl) {
				throw new Error(ProfileErrors.IMAGE_UPLOAD_FAILED);
			}

			updateData.image = upload.data.ufsUrl;

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
