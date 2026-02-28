import { login, register } from "./_authentication";
import { sendFriendRequest, removeFriendship, acceptFriendRequest } from "./_friendshipRelation";
import { uploadImage, deleteImage } from "./_image";
import { sendMessage, removeMessage } from "./_message";
import { updateProfile, removeProfileImage } from "./_profile";
import { requestPasswordReset, resetPassword } from "./_passwordRecovery";

export const server = {
	// auth
	login,
	register,
	// friendship
	sendFriendRequest,
	removeFriendship,
	acceptFriendRequest,
	// post upload
	uploadImage,
	deleteImage,
	// messages
	sendMessage,
	removeMessage,
	// profile
	updateProfile,
	removeProfileImage,
	// password reset
	requestPasswordReset,
	resetPassword,
};
