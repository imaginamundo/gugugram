import { moderationRepository } from "@repositories/moderation";
import { ReportErrors } from "@customTypes/errors";
import sanitizeHtml from "sanitize-html";
import { reportTargetTypes } from "@schemas/database";

type TargetType = (typeof reportTargetTypes)[number];

const MAX_REASON_LENGTH = 1000;

async function submitReport(params: {
	reporterId: string;
	targetType: TargetType;
	targetId: string;
	reason?: string;
}) {
	const target = await moderationRepository.resolveTargetAuthor(params.targetType, params.targetId);
	if (!target) throw new Error(ReportErrors.TARGET_NOT_FOUND);
	if (target.authorId === params.reporterId) throw new Error(ReportErrors.CANNOT_REPORT_SELF);

	const reason = params.reason
		? sanitizeHtml(params.reason).slice(0, MAX_REASON_LENGTH).trim() || undefined
		: undefined;

	await moderationRepository.insertReport({
		reporterId: params.reporterId,
		targetType: params.targetType,
		targetId: params.targetId,
		reason,
	});
}

export async function reportImagePost(reporterId: string, imagePostId: string, reason?: string) {
	await submitReport({
		reporterId,
		targetType: "image_post",
		targetId: imagePostId,
		reason,
	});
}

export async function reportImagePostComment(
	reporterId: string,
	commentId: string,
	reason?: string,
) {
	await submitReport({
		reporterId,
		targetType: "image_post_comment",
		targetId: commentId,
		reason,
	});
}

export async function reportMessage(reporterId: string, messageId: string, reason?: string) {
	await submitReport({
		reporterId,
		targetType: "message",
		targetId: messageId,
		reason,
	});
}

export async function reportUser(reporterId: string, username: string, reason?: string) {
	const user = await moderationRepository.resolveUserByUsername(username);
	if (!user) throw new Error(ReportErrors.TARGET_NOT_FOUND);
	await submitReport({
		reporterId,
		targetType: "user",
		targetId: user.id,
		reason,
	});
}
