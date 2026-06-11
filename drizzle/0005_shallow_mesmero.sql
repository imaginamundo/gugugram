CREATE TYPE "public"."report_status" AS ENUM('open', 'actioned', 'dismissed');--> statement-breakpoint
CREATE TYPE "public"."report_target_type" AS ENUM('image_post', 'image_post_comment', 'message', 'user');--> statement-breakpoint
CREATE TABLE "gugugram_moderation_reports" (
	"id" text PRIMARY KEY NOT NULL,
	"reporter_id" text NOT NULL,
	"target_type" "report_target_type" NOT NULL,
	"target_id" text NOT NULL,
	"reason" text,
	"status" "report_status" DEFAULT 'open' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"resolved_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "gugugram_moderation_reports" ADD CONSTRAINT "gugugram_moderation_reports_reporter_id_gugugram_users_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."gugugram_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "moderation_reports_target_idx" ON "gugugram_moderation_reports" USING btree ("target_type","target_id");--> statement-breakpoint
CREATE INDEX "moderation_reports_status_idx" ON "gugugram_moderation_reports" USING btree ("status","created_at");