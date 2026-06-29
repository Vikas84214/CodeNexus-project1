import { Router, type IRouter } from "express";
import healthRouter from "./health";
import problemsRouter from "./problems";
import submissionsRouter from "./submissions";
import usersRouter from "./users";
import contestsRouter from "./contests";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(problemsRouter);
router.use(submissionsRouter);
router.use(usersRouter);
router.use(contestsRouter);
router.use(dashboardRouter);

export default router;
