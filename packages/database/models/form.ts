import { pgTable, uuid, timestamp, varchar, pgEnum, integer } from "drizzle-orm/pg-core";
import { usersTable } from "./user";

export const formVisibilityEnum = pgEnum("form_visibility", ["PUBLIC", "UNLISTED"]);
export const formStatusEnum = pgEnum("form_status", ["PUBLISHED", "UNPUBLISHED"]);

export const formsTable = pgTable("forms", {
    id: uuid("id").primaryKey().defaultRandom(),

    title: varchar("title", { length: 50 }).notNull(),
    description: varchar("description", { length: 300 }),

    visibility: formVisibilityEnum("visibility").default("PUBLIC").notNull(),
    status: formStatusEnum("status").default("UNPUBLISHED").notNull(),

    createdBy: uuid("created_by").references(() => usersTable.id),

    maxResponses: integer("max_responses"),
    expiresAt: timestamp("expires_at"),

    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
