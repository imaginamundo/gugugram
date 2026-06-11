import { defineAction } from "astro:actions";
import { z } from "astro/zod";
import { parseSchema } from "@utils/validation";
import { withAuth } from "@utils/action-guard";

import {
	reportImagePost as svcReportImagePost,
	reportImagePostComment as svcReportImagePostComment,
	reportMessage as svcReportMessage,
	reportUser as svcReportUser,
} from "@services/moderation";
import { ReportErrors } from "@customTypes/errors";
import { trackServerEvent, flushServerEvents } from "@observability/tracking-server";

const ReasonField = z.string().max(1000).optional();

const ReportImagePostSchema = z.object({
	imagePostId: z.string().min(1),
	reason: ReasonField,
});

export const reportImagePost = defineAction({
	accept: "form",
	handler: withAuth(async (input: FormData, _, session) => {
		const { fields, success: schemaSuccess } = parseSchema(input, ReportImagePostSchema);
		if (!schemaSuccess) return { success: false as const, error: "Dados inválidos." };

		try {
			await svcReportImagePost(session.id, fields.imagePostId, fields.reason);
			trackServerEvent({
				distinctId: session.username ?? session.id,
				event: "moderation_report_submitted",
				properties: { target_type: "image_post" },
			});
			await flushServerEvents();
			return { success: true as const };
		} catch (error) {
			return mapReportError(error);
		}
	}),
});

const ReportImagePostCommentSchema = z.object({
	commentId: z.string().min(1),
	reason: ReasonField,
});

export const reportImagePostComment = defineAction({
	accept: "form",
	handler: withAuth(async (input: FormData, _, session) => {
		const { fields, success: schemaSuccess } = parseSchema(input, ReportImagePostCommentSchema);
		if (!schemaSuccess) return { success: false as const, error: "Dados inválidos." };

		try {
			await svcReportImagePostComment(session.id, fields.commentId, fields.reason);
			trackServerEvent({
				distinctId: session.username ?? session.id,
				event: "moderation_report_submitted",
				properties: { target_type: "image_post_comment" },
			});
			await flushServerEvents();
			return { success: true as const };
		} catch (error) {
			return mapReportError(error);
		}
	}),
});

const ReportMessageSchema = z.object({
	messageId: z.string().min(1),
	reason: ReasonField,
});

export const reportMessage = defineAction({
	accept: "form",
	handler: withAuth(async (input: FormData, _, session) => {
		const { fields, success: schemaSuccess } = parseSchema(input, ReportMessageSchema);
		if (!schemaSuccess) return { success: false as const, error: "Dados inválidos." };

		try {
			await svcReportMessage(session.id, fields.messageId, fields.reason);
			trackServerEvent({
				distinctId: session.username ?? session.id,
				event: "moderation_report_submitted",
				properties: { target_type: "message" },
			});
			await flushServerEvents();
			return { success: true as const };
		} catch (error) {
			return mapReportError(error);
		}
	}),
});

const ReportUserSchema = z.object({
	username: z.string().min(1),
	reason: ReasonField,
});

export const reportUser = defineAction({
	accept: "form",
	handler: withAuth(async (input: FormData, _, session) => {
		const { fields, success: schemaSuccess } = parseSchema(input, ReportUserSchema);
		if (!schemaSuccess) return { success: false as const, error: "Dados inválidos." };

		try {
			await svcReportUser(session.id, fields.username, fields.reason);
			trackServerEvent({
				distinctId: session.username ?? session.id,
				event: "moderation_report_submitted",
				properties: { target_type: "user" },
			});
			await flushServerEvents();
			return { success: true as const };
		} catch (error) {
			return mapReportError(error);
		}
	}),
});

function mapReportError(error: unknown) {
	if (error instanceof Error) {
		switch (error.message) {
			case ReportErrors.TARGET_NOT_FOUND:
				return { success: false as const, error: "Conteúdo denunciado não foi encontrado." };
			case ReportErrors.CANNOT_REPORT_SELF:
				return { success: false as const, error: "Você não pode denunciar a si mesmo." };
		}
	}
	return { success: false as const, error: "Erro interno ao registrar denúncia." };
}
