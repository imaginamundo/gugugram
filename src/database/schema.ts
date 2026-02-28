import crypto from "node:crypto";

import { relations, sql } from "drizzle-orm";
import {
	check,
	pgEnum,
	pgTableCreator,
	text,
	boolean,
	timestamp,
	uniqueIndex,
} from "drizzle-orm/pg-core";

export const createTable = pgTableCreator((name) => `gugugram_${name}`);

export const users = createTable("users", {
	id: text("id").primaryKey(),
	name: text("name"),
	username: text("username").unique().notNull(),
	displayUsername: text("display_username").notNull(),
	email: text("email").unique().notNull(),
	emailVerified: boolean("email_verified").notNull().default(false),
	image: text("image"),
	description: text("description"),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
});

export const images = createTable("images", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	image: text("image").notNull(),
	authorId: text("author_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const messages = createTable("messages", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	body: text("body").notNull(),
	authorId: text("author_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	receiverId: text("receiver_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const friendshipPossibleStatus = ["pending", "accepted"] as const;
export const statusEnum = pgEnum("status", friendshipPossibleStatus);

export const userFriends = createTable(
	"user_friends",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		requestUserId: text("request_user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		targetUserId: text("target_user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		status: statusEnum("status").notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
	},
	(table) => [
		uniqueIndex("unique_friends_index").on(table.requestUserId, table.targetUserId),
		check("no_self_friend", sql`${table.requestUserId} <> ${table.targetUserId}`),
	],
);

export const usersRelations = relations(users, ({ one, many }) => ({
	images: many(images),
	requestedFriends: many(userFriends, {
		relationName: "friendship_requester",
	}),
	targetedFriends: many(userFriends, {
		relationName: "friendship_target",
	}),
	messagesSent: many(messages, {
		relationName: "messages_author",
	}),
	messagesReceived: many(messages, {
		relationName: "messages_receiver",
	}),
}));

export const userFriendsRelations = relations(userFriends, ({ one }) => ({
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
		relationName: "messages_author",
	}),
}));

export const messagesUserAuthorRelations = relations(messages, ({ one }) => ({
	author: one(users, {
		fields: [messages.authorId],
		references: [users.id],
		relationName: "messages_author",
	}),
	receiver: one(users, {
		fields: [messages.receiverId],
		references: [users.id],
		relationName: "messages_receiver",
	}),
}));

// Required for better-auth
export const sessions = createTable("sessions", {
	id: text("id").primaryKey(),
	expiresAt: timestamp("expires_at").notNull(),
	token: text("token").notNull().unique(),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: text("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
});

export const accounts = createTable("accounts", {
	id: text("id").primaryKey(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at"),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
	scope: text("scope"),
	password: text("password").notNull(),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
});

export const verifications = createTable("verifications", {
	id: text("id").primaryKey(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: timestamp("expires_at").notNull(),
	createdAt: timestamp("created_at"),
	updatedAt: timestamp("updated_at"),
});
