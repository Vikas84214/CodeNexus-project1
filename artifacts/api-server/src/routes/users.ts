import { Router, type IRouter } from "express";
import { eq, desc, and } from "drizzle-orm";
import { db, usersTable, submissionsTable } from "@workspace/db";
import {
  ListUsersQueryParams,
  CreateUserBody,
  GetUserParams,
  GetUserSubmissionsParams,
  GetUserStatsParams,
  LoginBody,
  ListUsersResponse,
  CreateUserResponse,
  GetUserResponse,
  GetUserSubmissionsResponse,
  GetUserStatsResponse,
  GetCurrentUserResponse,
  LoginResponse,
  LogoutResponse,
} from "@workspace/api-zod";
import { problemsTable } from "@workspace/db";

const router: IRouter = Router();

function hashPassword(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash.toString(16);
}

function formatUser(user: typeof usersTable.$inferSelect) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    rating: user.rating,
    rank: user.rank,
    solvedCount: user.solvedCount,
    streak: user.streak,
    bio: user.bio ?? null,
    avatarUrl: user.avatarUrl ?? null,
    createdAt: user.createdAt.toISOString(),
    badges: user.badges ?? [],
  };
}

router.get("/users", async (req, res): Promise<void> => {
  const query = ListUsersQueryParams.safeParse(req.query);
  const limit = query.success ? (query.data.limit ?? 50) : 50;

  const users = await db
    .select()
    .from(usersTable)
    .orderBy(desc(usersTable.rating))
    .limit(limit);

  const ranked = users.map((u, i) => ({ ...formatUser(u), rank: i + 1 }));
  res.json(ListUsersResponse.parse(ranked));
});

router.post("/users", async (req, res): Promise<void> => {
  const parsed = CreateUserBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const existing = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.username, parsed.data.username))
    .limit(1);

  if (existing.length > 0) {
    res.status(400).json({ error: "Username already taken" });
    return;
  }

  const [user] = await db
    .insert(usersTable)
    .values({
      username: parsed.data.username,
      email: parsed.data.email,
      passwordHash: hashPassword(parsed.data.password),
      bio: parsed.data.bio ?? null,
      rating: 1500,
      rank: 0,
      solvedCount: 0,
      streak: 0,
      badges: [],
    })
    .returning();

  res.status(201).json(CreateUserResponse.parse(formatUser(user)));
});

router.get("/users/me", async (req, res): Promise<void> => {
  const [user] = await db.select().from(usersTable).limit(1);
  if (!user) {
    res.status(404).json({ error: "No users found" });
    return;
  }
  res.json(GetCurrentUserResponse.parse(formatUser(user)));
});

router.get("/users/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetUserParams.safeParse({ id: raw });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, params.data.id));
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json(GetUserResponse.parse(formatUser(user)));
});

router.get("/users/:id/submissions", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetUserSubmissionsParams.safeParse({ id: raw });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const rows = await db
    .select({
      submission: submissionsTable,
      problemTitle: problemsTable.title,
      username: usersTable.username,
    })
    .from(submissionsTable)
    .leftJoin(problemsTable, eq(submissionsTable.problemId, problemsTable.id))
    .leftJoin(usersTable, eq(submissionsTable.userId, usersTable.id))
    .where(eq(submissionsTable.userId, params.data.id))
    .orderBy(desc(submissionsTable.createdAt))
    .limit(50);

  const result = rows.map((r) => ({
    ...r.submission,
    createdAt: r.submission.createdAt.toISOString(),
    problemTitle: r.problemTitle ?? null,
    username: r.username ?? null,
  }));

  res.json(GetUserSubmissionsResponse.parse(result));
});

router.get("/users/:id/stats", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetUserStatsParams.safeParse({ id: raw });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, params.data.id));
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const submissions = await db
    .select({
      submission: submissionsTable,
      difficulty: problemsTable.difficulty,
    })
    .from(submissionsTable)
    .leftJoin(problemsTable, eq(submissionsTable.problemId, problemsTable.id))
    .where(eq(submissionsTable.userId, params.data.id));

  const accepted = submissions.filter((s) => s.submission.verdict === "Accepted");
  const solvedEasy = new Set(
    accepted.filter((s) => s.difficulty === "Easy").map((s) => s.submission.problemId)
  ).size;
  const solvedMedium = new Set(
    accepted.filter((s) => s.difficulty === "Medium").map((s) => s.submission.problemId)
  ).size;
  const solvedHard = new Set(
    accepted.filter((s) => s.difficulty === "Hard").map((s) => s.submission.problemId)
  ).size;

  const langMap: Record<string, number> = {};
  for (const s of submissions) {
    const lang = s.submission.language;
    langMap[lang] = (langMap[lang] ?? 0) + 1;
  }
  const languageStats = Object.entries(langMap).map(([language, count]) => ({ language, count }));

  res.json(
    GetUserStatsResponse.parse({
      userId: user.id,
      solvedEasy,
      solvedMedium,
      solvedHard,
      totalSubmissions: submissions.length,
      acceptedSubmissions: accepted.length,
      streak: user.streak,
      rating: user.rating,
      languageStats,
    })
  );
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.username, parsed.data.username));

  if (!user || user.passwordHash !== hashPassword(parsed.data.password)) {
    res.status(401).json({ error: "Invalid username or password" });
    return;
  }

  res.json(
    LoginResponse.parse({
      user: formatUser(user),
      token: `token_${user.id}_${Date.now()}`,
    })
  );
});

router.post("/auth/logout", async (_req, res): Promise<void> => {
  res.json(LogoutResponse.parse({}));
});

export default router;
