import { Router, type IRouter } from "express";
import { eq, ilike, sql, and, inArray } from "drizzle-orm";
import { db, problemsTable, submissionsTable } from "@workspace/db";
import {
  ListProblemsQueryParams,
  GetProblemParams,
  CreateProblemBody,
  CreateProblemResponse,
  GetProblemResponse,
  GetDailyProblemResponse,
  GetProblemStatsResponse,
  ListProblemsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/problems", async (req, res): Promise<void> => {
  const query = ListProblemsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const { difficulty, tag, search } = query.data;

  const conditions = [];
  if (difficulty) {
    conditions.push(eq(problemsTable.difficulty, difficulty));
  }
  if (search) {
    conditions.push(ilike(problemsTable.title, `%${search}%`));
  }

  const problems =
    conditions.length > 0
      ? await db
          .select()
          .from(problemsTable)
          .where(and(...conditions))
          .orderBy(problemsTable.id)
      : await db.select().from(problemsTable).orderBy(problemsTable.id);

  let filteredProblems = problems;
  if (tag) {
    filteredProblems = problems.filter((p) =>
      p.tags.some((t) => t.toLowerCase() === tag.toLowerCase())
    );
  }

  const result = filteredProblems.map((p) => ({
    id: p.id,
    title: p.title,
    difficulty: p.difficulty,
    tags: p.tags,
    acceptanceRate: p.acceptanceRate,
    totalSubmissions: p.totalSubmissions,
    isSolved: false,
    isPremium: p.isPremium,
  }));

  res.json(ListProblemsResponse.parse(result));
});

router.post("/problems", async (req, res): Promise<void> => {
  const parsed = CreateProblemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const defaultStarterCode = {
    javascript: `/**
 * @param {number[]} nums
 * @return {number}
 */
var solution = function(nums) {
    // Write your solution here
};`,
    python: `class Solution:
    def solution(self, nums: list) -> int:
        # Write your solution here
        pass`,
    cpp: `class Solution {
public:
    int solution(vector<int>& nums) {
        // Write your solution here
    }
};`,
    java: `class Solution {
    public int solution(int[] nums) {
        // Write your solution here
    }
}`,
  };

  const [problem] = await db
    .insert(problemsTable)
    .values({
      title: parsed.data.title,
      difficulty: parsed.data.difficulty,
      description: parsed.data.description,
      tags: parsed.data.tags ?? [],
      constraints: parsed.data.constraints ?? [],
      hints: parsed.data.hints ?? [],
      companies: parsed.data.companies ?? [],
      examples: [],
      starterCode: defaultStarterCode,
    })
    .returning();

  res.status(201).json(
    CreateProblemResponse.parse({
      ...problem,
      examples: problem.examples as [],
      starterCode: problem.starterCode as Record<string, string>,
      isSolved: false,
    })
  );
});

router.get("/problems/stats", async (_req, res): Promise<void> => {
  const problems = await db.select().from(problemsTable);
  const stats = {
    total: problems.length,
    easy: problems.filter((p) => p.difficulty === "Easy").length,
    medium: problems.filter((p) => p.difficulty === "Medium").length,
    hard: problems.filter((p) => p.difficulty === "Hard").length,
    solvedEasy: 0,
    solvedMedium: 0,
    solvedHard: 0,
  };
  res.json(GetProblemStatsResponse.parse(stats));
});

router.get("/problems/daily", async (_req, res): Promise<void> => {
  const [daily] = await db
    .select()
    .from(problemsTable)
    .where(eq(problemsTable.isDaily, true))
    .limit(1);

  const problem = daily ?? (await db.select().from(problemsTable).limit(1))[0];

  if (!problem) {
    res.status(404).json({ error: "No problem found" });
    return;
  }

  res.json(
    GetDailyProblemResponse.parse({
      id: problem.id,
      title: problem.title,
      difficulty: problem.difficulty,
      tags: problem.tags,
      acceptanceRate: problem.acceptanceRate,
      totalSubmissions: problem.totalSubmissions,
      isSolved: false,
      isPremium: problem.isPremium,
    })
  );
});

router.get("/problems/:id", async (req, res): Promise<void> => {
  const params = GetProblemParams.safeParse({
    id: Array.isArray(req.params.id) ? req.params.id[0] : req.params.id,
  });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [problem] = await db
    .select()
    .from(problemsTable)
    .where(eq(problemsTable.id, params.data.id));

  if (!problem) {
    res.status(404).json({ error: "Problem not found" });
    return;
  }

  res.json(
    GetProblemResponse.parse({
      ...problem,
      examples: problem.examples as [],
      starterCode: problem.starterCode as Record<string, string>,
      isSolved: false,
    })
  );
});

export default router;
