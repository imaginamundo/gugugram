CREATE TYPE "public"."status" AS ENUM('pending', 'accepted');--> statement-breakpoint
CREATE TABLE "gugugram_accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gugugram_images" (
	"id" text PRIMARY KEY NOT NULL,
	"image" text NOT NULL,
	"author_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gugugram_messages" (
	"id" text PRIMARY KEY NOT NULL,
	"body" text NOT NULL,
	"author_id" text NOT NULL,
	"receiver_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gugugram_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "gugugram_sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "gugugram_user_friends" (
	"id" text PRIMARY KEY NOT NULL,
	"request_user_id" text NOT NULL,
	"target_user_id" text NOT NULL,
	"status" "status" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	CONSTRAINT "no_self_friend" CHECK ("gugugram_user_friends"."request_user_id" <> "gugugram_user_friends"."target_user_id")
);
--> statement-breakpoint
CREATE TABLE "gugugram_users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"username" text NOT NULL,
	"display_username" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"description" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "gugugram_users_username_unique" UNIQUE("username"),
	CONSTRAINT "gugugram_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "gugugram_verifications" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp,
	"updated_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "gugugram_accounts" ADD CONSTRAINT "gugugram_accounts_user_id_gugugram_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."gugugram_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gugugram_images" ADD CONSTRAINT "gugugram_images_author_id_gugugram_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."gugugram_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gugugram_messages" ADD CONSTRAINT "gugugram_messages_author_id_gugugram_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."gugugram_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gugugram_messages" ADD CONSTRAINT "gugugram_messages_receiver_id_gugugram_users_id_fk" FOREIGN KEY ("receiver_id") REFERENCES "public"."gugugram_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gugugram_sessions" ADD CONSTRAINT "gugugram_sessions_user_id_gugugram_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."gugugram_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gugugram_user_friends" ADD CONSTRAINT "gugugram_user_friends_request_user_id_gugugram_users_id_fk" FOREIGN KEY ("request_user_id") REFERENCES "public"."gugugram_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gugugram_user_friends" ADD CONSTRAINT "gugugram_user_friends_target_user_id_gugugram_users_id_fk" FOREIGN KEY ("target_user_id") REFERENCES "public"."gugugram_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "unique_friends_index" ON "gugugram_user_friends" USING btree ("request_user_id","target_user_id");