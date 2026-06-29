import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, usersTable, problemsTable, submissionsTable, contestsTable } from "@workspace/db";
import {
  GetDashboardSummaryResponse,
  GetRecentActivityQueryParams,
  GetGlobalLeaderboardQueryParams,
  GetRecentActivityResponse,
  GetGlobalLeaderboardResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/dashboard/summary", async (_req, res): Promise<void> => {
  const [problems, users, submissions, contests] = await Promise.all([
    db.select().from(problemsTable),
    db.select().from(usersTable),
    db.select().from(submissionsTable),
    db.select().from(contestsTable),
  ]);

  const now = new Date();
  const activeContests = contests.filter(
    (c) => c.startTime <= now && c.endTime >= now
  ).length;

  const summary = {
    totalProblems: problems.length,
    totalUsers: users.length,
    totalSubmissions: submissions.length,
    totalAccepted: submissions.filter((s) => s.verdict === "Accepted").length,
    activeContests,
    easyCount: problems.filter((p) => p.difficulty === "Easy").length,
    mediumCount: problems.filter((p) => p.difficulty === "Medium").length,
    hardCount: problems.filter((p) => p.difficulty === "Hard").length,
  };

  res.json(GetDashboardSummaryResponse.parse(summary));
});

router.get("/dashboard/activity", async (req, res): Promise<void> => {
  const query = GetRecentActivityQueryParams.safeParse(req.query);
  const limit = query.success ? (query.data.limit ?? 10) : 10;

  const rows = await db
    .select({
      submission: submissionsTable,
      problemTitle: problemsTable.title,
      username: usersTable.username,
    })
    .from(submissionsTable)
    .leftJoin(problemsTable, eq(submissionsTable.problemId, problemsTable.id))
    .leftJoin(usersTable, eq(submissionsTable.userId, usersTable.id))
    .orderBy(desc(submissionsTable.createdAt))
    .limit(limit);

  const result = rows.map((r) => ({
    id: r.submission.id,
    userId: r.submission.userId,
    username: r.username ?? "anonymous",
    problemId: r.submission.problemId,
    problemTitle: r.problemTitle ?? "Unknown",
    verdict: r.submission.verdict,
    language: r.submission.language,
    createdAt: r.submission.createdAt.toISOString(),
  }));

  res.json(GetRecentActivityResponse.parse(result));
});

router.get("/dashboard/leaderboard", async (req, res): Promise<void> => {
  const query = GetGlobalLeaderboardQueryParams.safeParse(req.query);
  const limit = query.success ? (query.data.limit ?? 10) : 10;

  const users = await db
    .select()
    .from(usersTable)
    .orderBy(desc(usersTable.rating))
    .limit(limit);

  const result = users.map((u, i) => ({
    id: u.id,
    username: u.username,
    email: u.email,
    rating: u.rating,
    rank: i + 1,
    solvedCount: u.solvedCount,
    streak: u.streak,
    bio: u.bio ?? null,
    avatarUrl: u.avatarUrl ?? null,
    createdAt: u.createdAt.toISOString(),
    badges: u.badges ?? [],
  }));

  res.json(GetGlobalLeaderboardResponse.parse(result));
});

export default router;
