import {
  mysqlTable,
  mysqlEnum,
  serial,
  bigint,
  int,
  varchar,
  text,
  timestamp,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  // Self-hosted local auth (null for Kimi OAuth users)
  username: varchar("username", { length: 100 }).unique(),
  passwordHash: varchar("passwordHash", { length: 255 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const events = mysqlTable("events", {
  id: serial("id").primaryKey(),
  hostId: bigint("hostId", { mode: "number", unsigned: true }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  category: mysqlEnum("category", [
    "study",
    "business",
    "culture",
    "networking",
    "language",
    "sports",
    "other",
  ])
    .default("other")
    .notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  venue: varchar("venue", { length: 255 }).notNull(),
  eventDate: timestamp("eventDate").notNull(),
  contact: varchar("contact", { length: 255 }),
  capacity: int("capacity"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Event = typeof events.$inferSelect;
export type InsertEvent = typeof events.$inferInsert;

export const eventReviews = mysqlTable("event_reviews", {
  id: serial("id").primaryKey(),
  eventId: bigint("eventId", { mode: "number", unsigned: true }).notNull(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  rating: int("rating").notNull(),
  comment: text("comment").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type EventReview = typeof eventReviews.$inferSelect;
export type InsertEventReview = typeof eventReviews.$inferInsert;

export const ads = mysqlTable("ads", {
  id: serial("id").primaryKey(),
  ownerId: bigint("ownerId", { mode: "number", unsigned: true }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  category: mysqlEnum("category", [
    "translator",
    "sourcing_agent",
    "supplier",
    "housing",
    "legal",
    "education",
    "logistics",
    "other",
  ])
    .default("other")
    .notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  contact: varchar("contact", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Ad = typeof ads.$inferSelect;
export type InsertAd = typeof ads.$inferInsert;
