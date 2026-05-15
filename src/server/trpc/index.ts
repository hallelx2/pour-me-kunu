import { router } from "./init";
import { authRouter } from "./routers/auth";
import { creatorsRouter } from "./routers/creators";
import { tipsRouter } from "./routers/tips";
import { membershipsRouter } from "./routers/memberships";

export const appRouter = router({
  auth: authRouter,
  creators: creatorsRouter,
  tips: tipsRouter,
  memberships: membershipsRouter,
});

export type AppRouter = typeof appRouter;
