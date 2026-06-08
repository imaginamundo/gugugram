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
	createCommunity,
	deleteCommunity,
	promoteAdmin,
	removeAdmin,
	transferOwnership,
	subscribe,
	unsubscribe,
	createPost,
	deletePost,
	createResponse,
	deleteResponse,
} from "./_community.ts";

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
	// communities
	createCommunity,
	deleteCommunity,
	promoteAdmin,
	removeAdmin,
	transferOwnership,
	subscribe,
	unsubscribe,
	createPost,
	deletePost,
	createResponse,
	deleteResponse,
};
