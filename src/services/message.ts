// src/services/message.ts
import sanitizeHtml from "sanitize-html";
import { messageRepository } from "@repositories/message";

const RATE_LIMIT_MS = 5000;

export async function getMessages(username: string) {
	const messagesData = await messageRepository.getMessagesByUsername(username);

	if (!messagesData) return { messagesReceived: [] };

	return messagesData;
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

	if (lastMessage) {
		const now = new Date().getTime();
		const lastMessageTime = lastMessage.createdAt.getTime();
		const timeDiff = now - lastMessageTime;

		if (timeDiff < RATE_LIMIT_MS) {
			const timeLeft = Math.ceil((RATE_LIMIT_MS - timeDiff) / 1000);
			throw new Error(`Calma lá! Aguarde mais ${timeLeft} segundo(s) para enviar outra mensagem.`);
		}
	}

	const sanitizedBody = sanitizeHtml(body);
	if (!sanitizedBody) {
		throw new Error("Mensagem vazia");
	}

	await messageRepository.insertMessage(authorId, receiverId, sanitizedBody);
}

export async function deleteMessage(userId: string, messageId: string) {
	await messageRepository.deleteMessageByIdAndUser(messageId, userId);
}

export async function updateLastCheckedMessages(userId: string) {
	await messageRepository.updateLastCheckedAt(userId, new Date());
}
