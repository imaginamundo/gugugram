CREATE INDEX "communities_owner_idx" ON "gugugram_communities" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "community_posts_community_idx" ON "gugugram_community_posts" USING btree ("community_id");--> statement-breakpoint
CREATE INDEX "community_responses_post_created_idx" ON "gugugram_community_responses" USING btree ("post_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "community_subscribers_user_idx" ON "gugugram_community_subscribers" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "image_post_comments_image_idx" ON "gugugram_image_post_comments" USING btree ("image_id");--> statement-breakpoint
CREATE INDEX "image_post_comments_author_created_idx" ON "gugugram_image_post_comments" USING btree ("author_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "images_posts_author_created_idx" ON "gugugram_images_posts" USING btree ("author_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "images_posts_created_at_idx" ON "gugugram_images_posts" USING btree ("created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "messages_receiver_created_idx" ON "gugugram_messages" USING btree ("receiver_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "messages_author_created_idx" ON "gugugram_messages" USING btree ("author_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "user_friends_target_idx" ON "gugugram_user_friends" USING btree ("target_user_id");
