ALTER TABLE "gugugram_images" RENAME TO "gugugram_images_posts";--> statement-breakpoint
ALTER TABLE "gugugram_images_posts" DROP CONSTRAINT "gugugram_images_author_id_gugugram_users_id_fk";
--> statement-breakpoint
ALTER TABLE "gugugram_images_posts" ADD CONSTRAINT "gugugram_images_posts_author_id_gugugram_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."gugugram_users"("id") ON DELETE cascade ON UPDATE no action;