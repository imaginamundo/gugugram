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
import {
	reportImagePost,
	reportImagePostComment,
	reportMessage,
	reportUser,
} from "./_moderation.ts";
import { deleteAccount } from "./_accountDeletion.ts";

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
	// moderation
	reportImagePost,
	reportImagePostComment,
	reportMessage,
	reportUser,
	// account deletion
	deleteAccount,
};
