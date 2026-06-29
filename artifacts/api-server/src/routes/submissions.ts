import { Router, type IRouter } from "express";
import { eq, desc, and } from "drizzle-orm";
import { db, submissionsTable, problemsTable, usersTable } from "@workspace/db";
import {
  ListSubmissionsQueryParams,
  CreateSubmissionBody,
  GetSubmissionParams,
  RunCodeBody,
  CreateSubmissionResponse,
  GetSubmissionResponse,
  ListSubmissionsResponse,
  RunCodeResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

const VERDICTS = [
  "Accepted",
  "Accepted",
  "Accepted",
  "Wrong Answer",
  "Time Limit Exceeded",
  "Runtime Error",
];

function judgeCode(
  language: string,
  code: string,
  problemId: number
): {
  verdict: string;
  runtime: number;
  memory: number;
  testCasesPassed: number;
  totalTestCases: number;
} {
  const totalTestCases = 5 + Math.floor(Math.random() * 10);

  if (!code || code.trim().length < 10) {
    return {
      verdict: "Compilation Error",
      runtime: 0,
      memory: 0,
      testCasesPassed: 0,
      totalTestCases,
    };
  }

  const verdictIdx = Math.floor(Math.random() * VERDICTS.length);
  const verdict = VERDICTS[verdictIdx];
  const testCasesPassed =
    verdict === "Accepted" ? totalTestCases : Math.floor(Math.random() * totalTestCases);

  return {
    verdict,
    runtime: 40 + Math.floor(Math.random() * 200),
    memory: 15000 + Math.floor(Math.random() * 5000),
    testCasesPassed,
    totalTestCases,
  };
}

router.get("/submissions", async (req, res): Promise<void> => {
  const query = ListSubmissionsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const { problemId, userId, limit } = query.data;
  const conditions = [];
  if (problemId) conditions.push(eq(submissionsTable.problemId, problemId));
  if (userId) conditions.push(eq(submissionsTable.userId, userId));

  const rows =
    conditions.length > 0
      ? await db
          .select({
            submission: submissionsTable,
            problemTitle: problemsTable.title,
            username: usersTable.username,
          })
          .from(submissionsTable)
          .leftJoin(problemsTable, eq(submissionsTable.problemId, problemsTable.id))
          .leftJoin(usersTable, eq(submissionsTable.userId, usersTable.id))
          .where(and(...conditions))
          .orderBy(desc(submissionsTable.createdAt))
          .limit(limit ?? 20)
      : await db
          .select({
            submission: submissionsTable,
            problemTitle: problemsTable.title,
            username: usersTable.username,
          })
          .from(submissionsTable)
          .leftJoin(problemsTable, eq(submissionsTable.problemId, problemsTable.id))
          .leftJoin(usersTable, eq(submissionsTable.userId, usersTable.id))
          .orderBy(desc(submissionsTable.createdAt))
          .limit(limit ?? 20);

  const result = rows.map((r) => ({
    ...r.submission,
    problemTitle: r.problemTitle ?? null,
    username: r.username ?? null,
    createdAt: r.submission.createdAt.toISOString(),
  }));

  res.json(ListSubmissionsResponse.parse(result));
});

router.post("/submissions", async (req, res): Promise<void> => {
  const parsed = CreateSubmissionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { problemId, language, code, userId } = parsed.data;
  const effectiveUserId = userId ?? 1;

  const result = judgeCode(language, code, problemId);

  const [sub] = await db
    .insert(submissionsTable)
    .values({
      problemId,
      userId: effectiveUserId,
      language,
      code,
      verdict: result.verdict,
      runtime: result.runtime,
      memory: result.memory,
      testCasesPassed: result.testCasesPassed,
      totalTestCases: result.totalTestCases,
    })
    .returning();

  await db
    .update(problemsTable)
    .set({
      totalSubmissions: sql`${problemsTable.totalSubmissions} + 1`,
    })
    .where(eq(problemsTable.id, problemId));

  if (result.verdict === "Accepted") {
    const prevAccepted = await db
      .select()
      .from(submissionsTable)
      .where(
        and(
          eq(submissionsTable.problemId, problemId),
          eq(submissionsTable.userId, effectiveUserId),
          eq(submissionsTable.verdict, "Accepted")
        )
      )
      .limit(2);

    if (prevAccepted.length === 1) {
      await db
        .update(usersTable)
        .set({
          solvedCount: sql`${usersTable.solvedCount} + 1`,
        })
        .where(eq(usersTable.id, effectiveUserId));
    }

    const allSubs = await db.select().from(submissionsTable).where(eq(problemsTable.id, problemId));
    const acceptedCount = (
      await db
        .select()
        .from(submissionsTable)
        .where(and(eq(submissionsTable.problemId, problemId), eq(submissionsTable.verdict, "Accepted")))
    ).length;
    const totalCount = (
      await db.select().from(submissionsTable).where(eq(submissionsTable.problemId, problemId))
    ).length;
    if (totalCount > 0) {
      await db
        .update(problemsTable)
        .set({ acceptanceRate: (acceptedCount / totalCount) * 100 })
        .where(eq(problemsTable.id, problemId));
    }
  }

  const [problem] = await db.select().from(problemsTable).where(eq(problemsTable.id, problemId));
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, effectiveUserId));

  res.status(201).json(
    CreateSubmissionResponse.parse({
      ...sub,
      createdAt: sub.createdAt.toISOString(),
      problemTitle: problem?.title ?? null,
      username: user?.username ?? null,
    })
  );
});

router.post("/submissions/run", async (req, res): Promise<void> => {
  const parsed = RunCodeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { language, code, customInput } = parsed.data;

  if (!code || code.trim().length < 5) {
    res.json(
      RunCodeResponse.parse({
        output: "",
        status: "Compilation Error",
        runtime: null,
        error: "Code is too short or empty",
      })
    );
    return;
  }

  const runtime = 30 + Math.floor(Math.random() * 100);
  const output = customInput
    ? `Input: ${customInput}\nOutput: [simulated output based on your code]`
    : "Output: [simulated execution result]";

  res.json(
    RunCodeResponse.parse({
      output,
      status: "Success",
      runtime,
      error: null,
    })
  );
});

router.get("/submissions/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetSubmissionParams.safeParse({ id: raw });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [row] = await db
    .select({
      submission: submissionsTable,
      problemTitle: problemsTable.title,
      username: usersTable.username,
    })
    .from(submissionsTable)
    .leftJoin(problemsTable, eq(submissionsTable.problemId, problemsTable.id))
    .leftJoin(usersTable, eq(submissionsTable.userId, usersTable.id))
    .where(eq(submissionsTable.id, params.data.id));

  if (!row) {
    res.status(404).json({ error: "Submission not found" });
    return;
  }

  res.json(
    GetSubmissionResponse.parse({
      ...row.submission,
      createdAt: row.submission.createdAt.toISOString(),
      problemTitle: row.problemTitle ?? null,
      username: row.username ?? null,
    })
  );
});

export default router;
