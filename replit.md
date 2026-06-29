# CodeNexus

A LeetCode-style competitive coding platform where developers solve algorithmic problems, participate in contests, and track their progress.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/codenexus run dev` — run the frontend (port 23586)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, wouter routing, TanStack Query, shadcn/ui, Tailwind CSS
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — API contract (source of truth)
- `lib/db/src/schema/` — Drizzle DB schema (users, problems, submissions, contests)
- `artifacts/api-server/src/routes/` — Express route handlers (problems, submissions, users, contests, dashboard)
- `artifacts/codenexus/src/` — React frontend (pages, components)

## Architecture decisions

- Simulated code judge: submissions are judged with a randomized verdict simulator (real Docker judge would be added in production)
- Auth is session-based using localStorage on the frontend (no JWT middleware yet — simple for MVP)
- Code editor uses a styled textarea with monospace font (Monaco Editor can be swapped in)
- All API hooks are generated via Orval from the OpenAPI spec — never write them manually

## Product

- **Problems** — 8 seeded algorithmic problems (Easy/Medium/Hard) with full descriptions, examples, constraints, hints, starter code in 4 languages
- **Code Workspace** — split-pane IDE with language selector, Run and Submit buttons
- **Contests** — upcoming/ongoing/finished contests with leaderboards
- **Dashboard** — platform stats, daily challenge, global activity feed
- **Leaderboard** — ranked users by rating
- **Profile** — per-user stats, solved counts, submission history
- **Auth** — login / register with localStorage session

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Route order matters in Express 5: `/problems/stats` and `/problems/daily` MUST be defined before `/problems/:id`
- The code judge is simulated; real execution requires Docker containers per language
- Run `pnpm --filter @workspace/api-spec run codegen` after any change to `openapi.yaml`

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
