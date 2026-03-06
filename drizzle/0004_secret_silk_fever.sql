CREATE TABLE "gugugram_image_post_comments" (
	"id" text PRIMARY KEY NOT NULL,
	"image_id" text NOT NULL,
	"author_id" text NOT NULL,
	"body" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "gugugram_image_post_comments" ADD CONSTRAINT "gugugram_image_post_comments_image_id_gugugram_images_posts_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."gugugram_images_posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gugugram_image_post_comments" ADD CONSTRAINT "gugugram_image_post_comments_author_id_gugugram_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."gugugram_users"("id") ON DELETE cascade ON UPDATE no action;