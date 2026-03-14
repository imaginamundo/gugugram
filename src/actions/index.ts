import { login, register } from "./_authentication.ts";
import { sendFriendRequest, removeFriendship, acceptFriendRequest } from "./_friendshipRelation.ts";
import {
	uploadImagePost,
	deleteImagePost,
	sendImagePostComment,
	deleteImagePostComment,
} from "./_imagePost.ts";
import { sendMessage, removeMessage } from "./_message.ts";
import { updateProfile, removeProfileImage } from "./_profile.ts";
import { requestPasswordReset, resetPassword } from "./_passwordRecovery.ts";

export const server = {
	// auth
	login,
	register,
	// friendship
	sendFriendRequest,
	removeFriendship,
	acceptFriendRequest,
	// post upload
	uploadImagePost,
	deleteImagePost,
	sendImagePostComment,
	deleteImagePostComment,
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
