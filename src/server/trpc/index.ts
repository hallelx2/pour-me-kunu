import { router } from "./init";
import { authRouter } from "./routers/auth";
import { creatorsRouter } from "./routers/creators";
import { tipsRouter } from "./routers/tips";
import { membershipsRouter } from "./routers/memberships";
import { payoutsRouter } from "./routers/payouts";

export const appRouter = router({
  auth: authRouter,
  creators: creatorsRouter,
  tips: tipsRouter,
  memberships: membershipsRouter,
  payouts: payoutsRouter,
});

export type AppRouter = typeof appRouter;
