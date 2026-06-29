import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const contestsTable = pgTable("contests", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  participantCount: integer("participant_count").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const contestProblemsTable = pgTable("contest_problems", {
  id: serial("id").primaryKey(),
  contestId: integer("contest_id").notNull(),
  problemId: integer("problem_id").notNull(),
  order: integer("order").notNull().default(0),
});

export const insertContestSchema = createInsertSchema(contestsTable).omit({ id: true, createdAt: true });
export type InsertContest = z.infer<typeof insertContestSchema>;
export type Contest = typeof contestsTable.$inferSelect;
