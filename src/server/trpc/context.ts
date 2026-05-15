import { auth } from "@/server/auth";
import { db } from "@/server/db";

export async function createContext({ req }: { req: Request }) {
  const session = await auth.api.getSession({ headers: req.headers });
  return {
    db,
    session,
    req,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
