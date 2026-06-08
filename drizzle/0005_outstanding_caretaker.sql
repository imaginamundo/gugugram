CREATE TABLE "gugugram_communities" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"image" text,
	"owner_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "gugugram_communities_title_unique" UNIQUE("title"),
	CONSTRAINT "gugugram_communities_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "gugugram_community_admins" (
	"id" text PRIMARY KEY NOT NULL,
	"community_id" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gugugram_community_posts" (
	"id" text PRIMARY KEY NOT NULL,
	"community_id" text NOT NULL,
	"author_id" text NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gugugram_community_responses" (
	"id" text PRIMARY KEY NOT NULL,
	"post_id" text NOT NULL,
	"author_id" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gugugram_community_subscribers" (
	"id" text PRIMARY KEY NOT NULL,
	"community_id" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "gugugram_communities" ADD CONSTRAINT "gugugram_communities_owner_id_gugugram_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."gugugram_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gugugram_community_admins" ADD CONSTRAINT "gugugram_community_admins_community_id_gugugram_communities_id_fk" FOREIGN KEY ("community_id") REFERENCES "public"."gugugram_communities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gugugram_community_admins" ADD CONSTRAINT "gugugram_community_admins_user_id_gugugram_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."gugugram_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gugugram_community_posts" ADD CONSTRAINT "gugugram_community_posts_community_id_gugugram_communities_id_fk" FOREIGN KEY ("community_id") REFERENCES "public"."gugugram_communities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gugugram_community_posts" ADD CONSTRAINT "gugugram_community_posts_author_id_gugugram_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."gugugram_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gugugram_community_responses" ADD CONSTRAINT "gugugram_community_responses_post_id_gugugram_community_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."gugugram_community_posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gugugram_community_responses" ADD CONSTRAINT "gugugram_community_responses_author_id_gugugram_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."gugugram_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gugugram_community_subscribers" ADD CONSTRAINT "gugugram_community_subscribers_community_id_gugugram_communities_id_fk" FOREIGN KEY ("community_id") REFERENCES "public"."gugugram_communities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gugugram_community_subscribers" ADD CONSTRAINT "gugugram_community_subscribers_user_id_gugugram_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."gugugram_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "unique_community_admin" ON "gugugram_community_admins" USING btree ("community_id","user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_community_subscriber" ON "gugugram_community_subscribers" USING btree ("community_id","user_id");