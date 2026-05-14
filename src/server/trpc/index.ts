import { router } from "./init";
import { authRouter } from "./routers/auth";
import { creatorsRouter } from "./routers/creators";

export const appRouter = router({
  auth: authRouter,
  creators: creatorsRouter,
});

export type AppRouter = typeof appRouter;
