import { pgTable, serial, text, integer, real, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const problemsTable = pgTable("problems", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  difficulty: text("difficulty").notNull(), // Easy | Medium | Hard
  description: text("description").notNull(),
  tags: text("tags").array().notNull().default([]),
  constraints: text("constraints").array().notNull().default([]),
  hints: text("hints").array().notNull().default([]),
  companies: text("companies").array().notNull().default([]),
  examples: jsonb("examples").notNull().default([]),
  starterCode: jsonb("starter_code").notNull().default({}),
  editorial: text("editorial"),
  acceptanceRate: real("acceptance_rate").notNull().default(0),
  totalSubmissions: integer("total_submissions").notNull().default(0),
  isPremium: boolean("is_premium").notNull().default(false),
  isDaily: boolean("is_daily").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertProblemSchema = createInsertSchema(problemsTable).omit({ id: true, createdAt: true });
export type InsertProblem = z.infer<typeof insertProblemSchema>;
export type Problem = typeof problemsTable.$inferSelect;
