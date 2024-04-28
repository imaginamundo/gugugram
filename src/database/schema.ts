import crypto from "node:crypto";

import {
  type InferInsertModel,
  type InferSelectModel,
  relations,
  sql,
} from "drizzle-orm";
import {
  index,
  pgEnum,
  pgTableCreator,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const createTable = pgTableCreator((name) => `gugugram_${name}`);

export const users = createTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  username: text("username").unique().notNull(),
  email: text("email").unique().notNull(),
  password: text("password").notNull(),
});
export type UserType = InferSelectModel<typeof users>;
export type NewUserType = InferInsertModel<typeof users>;

export const userProfiles = createTable("user_profiles", {
  id: serial("id").primaryKey(),
  userId: text("user_id"),
  description: text("description"),
  image: text("image"),
});
export type UserProfileType = InferSelectModel<typeof userProfiles>;

export const images = createTable("images", {
  id: serial("id").primaryKey(),
  image: text("image").notNull(),
  authorId: text("author_id").notNull(),
  createdAt: timestamp("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});
export type ImageType = InferSelectModel<typeof images>;
export type NewImageType = InferInsertModel<typeof images>;

export const messages = createTable("messages", {
  id: serial("id").primaryKey(),
  body: text("body").notNull(),
  authorId: text("author_id").notNull(),
  receiverId: text("receiver_id").notNull(),
  createdAt: timestamp("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});
export type MessageType = InferSelectModel<typeof messages>;
export type NewMessageType = InferInsertModel<typeof messages>;

export const statusEnum = pgEnum("status", ["pending", "accepted", "canceled"]);

export const userFriends = createTable(
  "user_friends",
  {
    id: serial("id").primaryKey(),
    requestUserId: text("request_user_id").notNull(),
    targetUserId: text("target_user_id").notNull(),
    status: statusEnum("status").notNull(),
    lastUpdate: timestamp("last_update")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    friends: index("friends_index").on(table.requestUserId, table.targetUserId),
  }),
);
export type UserFriendsType = InferSelectModel<typeof userFriends>;
export type NewUserFriendsType = InferInsertModel<typeof userFriends>;

export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(userProfiles, {
    fields: [users.id],
    references: [userProfiles.userId],
  }),
  images: many(images),
  friends: many(userFriends, {
    relationName: "user_friends",
  }),
  messages: many(messages, {
    relationName: "messages_received",
  }),
}));

export const friendsUserRelations = relations(userFriends, ({ one }) => ({
  requestUser: one(users, {
    fields: [userFriends.requestUserId],
    references: [users.id],
    relationName: "friendship_requester",
  }),
  targetUser: one(users, {
    fields: [userFriends.targetUserId],
    references: [users.id],
    relationName: "friendship_target",
  }),
}));

export const imagesUserAuthorRelations = relations(images, ({ one }) => ({
  author: one(users, {
    fields: [images.authorId],
    references: [users.id],
  }),
}));

export const messagesUserAuthorRelations = relations(messages, ({ one }) => ({
  author: one(users, {
    fields: [messages.authorId],
    references: [users.id],
  }),
  receiver: one(users, {
    fields: [messages.receiverId],
    references: [users.id],
    relationName: "messages_received",
  }),
}));
