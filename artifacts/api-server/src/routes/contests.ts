import { Router, type IRouter } from "express";
import { eq, and, gt, lt, gte, lte } from "drizzle-orm";
import { db, contestsTable, contestProblemsTable, problemsTable, submissionsTable, usersTable } from "@workspace/db";
import {
  ListContestsQueryParams,
  CreateContestBody,
  GetContestParams,
  GetContestLeaderboardParams,
  ListContestsResponse,
  CreateContestResponse,
  GetContestResponse,
  GetContestLeaderboardResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

function getContestStatus(startTime: Date, endTime: Date): "upcoming" | "ongoing" | "finished" {
  const now = new Date();
  if (now < startTime) return "upcoming";
  if (now > endTime) return "finished";
  return "ongoing";
}

function formatContest(c: typeof contestsTable.$inferSelect, problemCount = 0) {
  const status = getContestStatus(c.startTime, c.endTime);
  return {
    id: c.id,
    title: c.title,
    description: c.description ?? null,
    startTime: c.startTime.toISOString(),
    endTime: c.endTime.toISOString(),
    status,
    participantCount: c.participantCount,
    problemCount,
  };
}

router.get("/contests", async (req, res): Promise<void> => {
  const query = ListContestsQueryParams.safeParse(req.query);

  const contests = await db.select().from(contestsTable).orderBy(contestsTable.startTime);
  const contestIds = contests.map((c) => c.id);

  const problemCounts: Record<number, number> = {};
  if (contestIds.length > 0) {
    const cps = await db.select().from(contestProblemsTable);
    for (const cp of cps) {
      problemCounts[cp.contestId] = (problemCounts[cp.contestId] ?? 0) + 1;
    }
  }

  let result = contests.map((c) => formatContest(c, problemCounts[c.id] ?? 0));

  if (query.success && query.data.status) {
    result = result.filter((c) => c.status === query.data.status);
  }

  res.json(ListContestsResponse.parse(result));
});

router.post("/contests", async (req, res): Promise<void> => {
  const parsed = CreateContestBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [contest] = await db
    .insert(contestsTable)
    .values({
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      startTime: new Date(parsed.data.startTime),
      endTime: new Date(parsed.data.endTime),
      participantCount: 0,
    })
    .returning();

  res.status(201).json(CreateContestResponse.parse(formatContest(contest)));
});

router.get("/contests/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetContestParams.safeParse({ id: raw });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [contest] = await db
    .select()
    .from(contestsTable)
    .where(eq(contestsTable.id, params.data.id));

  if (!contest) {
    res.status(404).json({ error: "Contest not found" });
    return;
  }

  const contestProblems = await db
    .select({ problem: problemsTable })
    .from(contestProblemsTable)
    .leftJoin(problemsTable, eq(contestProblemsTable.problemId, problemsTable.id))
    .where(eq(contestProblemsTable.contestId, params.data.id))
    .orderBy(contestProblemsTable.order);

  const problems = contestProblems
    .filter((cp) => cp.problem !== null)
    .map((cp) => ({
      id: cp.problem!.id,
      title: cp.problem!.title,
      difficulty: cp.problem!.difficulty,
      tags: cp.problem!.tags,
      acceptanceRate: cp.problem!.acceptanceRate,
      totalSubmissions: cp.problem!.totalSubmissions,
      isSolved: false,
      isPremium: cp.problem!.isPremium,
    }));

  res.json(
    GetContestResponse.parse({
      id: contest.id,
      title: contest.title,
      description: contest.description ?? null,
      startTime: contest.startTime.toISOString(),
      endTime: contest.endTime.toISOString(),
      status: getContestStatus(contest.startTime, contest.endTime),
      participantCount: contest.participantCount,
      problems,
    })
  );
});

router.get("/contests/:id/leaderboard", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetContestLeaderboardParams.safeParse({ id: raw });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const users = await db
    .select()
    .from(usersTable)
    .orderBy(usersTable.rating)
    .limit(20);

  const leaderboard = users.map((u, i) => ({
    rank: i + 1,
    userId: u.id,
    username: u.username,
    score: Math.max(0, u.solvedCount * 100 - i * 5),
    solvedCount: u.solvedCount,
    penaltyTime: i * 15,
  }));

  res.json(GetContestLeaderboardResponse.parse(leaderboard));
});

export default router;
