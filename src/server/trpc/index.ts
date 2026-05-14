import { router } from "./init";
import { authRouter } from "./routers/auth";
import { creatorsRouter } from "./routers/creators";
import { tipsRouter } from "./routers/tips";

export const appRouter = router({
  auth: authRouter,
  creators: creatorsRouter,
  tips: tipsRouter,
});

export type AppRouter = typeof appRouter;
