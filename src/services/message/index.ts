import sanitizeHtml from "sanitize-html";
import { messageRepository } from "@repositories/message";
import { MessageErrors } from "@customTypes/errors";
import { checkRateLimit } from "@utils/content-rate-limit";

const RATE_LIMIT_MS = 5000;

export const MESSAGES_PAGE_SIZE = 50;

/**
 * Returns one page of the messages a user received, newest first. Takes the
 * receiver's id rather than their username: the caller already has it from
 * `getProfile`, and it is the value `messages_receiver_created_idx` is keyed
 * on. Callers get the total from `getProfile`'s `messagesCount`, so there is
 * no COUNT here.
 */
export async function getMessages(receiverId: string, page = 1) {
	const offset = (Math.max(1, page) - 1) * MESSAGES_PAGE_SIZE;
	const messagesReceived = await messageRepository.getMessagesByReceiverId(
		receiverId,
		MESSAGES_PAGE_SIZE,
		offset,
	);

	return { messagesReceived };
}

export type MessagesType = Awaited<ReturnType<typeof getMessages>>;

export async function updateLastRead(
	userId: string,
	session: App.Locals["user"],
	unreadMessagesCount: number = 0,
) {
	if (!session) return;

	if (session.id === userId && unreadMessagesCount > 0) {
		await messageRepository.updateLastCheckedAt(session.id, new Date());
	}
}

export async function processAndSendMessage(authorId: string, receiverId: string, body: string) {
	if (authorId === receiverId) {
		throw new Error("Não pode enviar mensagem para si");
	}

	const lastMessage = await messageRepository.getLatestMessageByAuthor(authorId);
	checkRateLimit(lastMessage?.createdAt, RATE_LIMIT_MS, "Calma lá! Aguarde mais");

	const sanitizedBody = sanitizeHtml(body);
	if (!sanitizedBody) {
		throw new Error("Mensagem vazia");
	}

	await messageRepository.insertMessage(authorId, receiverId, sanitizedBody);
}

export async function deleteMessage(userId: string, messageId: string) {
	const msg = await messageRepository.getMessageById(messageId);
	if (!msg) throw new Error(MessageErrors.MESSAGE_NOT_FOUND);
	if (msg.authorId !== userId && msg.receiverId !== userId)
		throw new Error(MessageErrors.FORBIDDEN);
	await messageRepository.deleteMessageById(messageId);
}

export async function updateLastCheckedMessages(userId: string) {
	await messageRepository.updateLastCheckedAt(userId, new Date());
}
