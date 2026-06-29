import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const submissionsTable = pgTable("submissions", {
  id: serial("id").primaryKey(),
  problemId: integer("problem_id").notNull(),
  userId: integer("user_id").notNull(),
  language: text("language").notNull(),
  code: text("code").notNull(),
  verdict: text("verdict").notNull(), // Accepted | Wrong Answer | TLE | MLE | CE | RE
  runtime: integer("runtime"), // ms
  memory: integer("memory"), // KB
  testCasesPassed: integer("test_cases_passed"),
  totalTestCases: integer("total_test_cases"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSubmissionSchema = createInsertSchema(submissionsTable).omit({ id: true, createdAt: true });
export type InsertSubmission = z.infer<typeof insertSubmissionSchema>;
export type Submission = typeof submissionsTable.$inferSelect;
