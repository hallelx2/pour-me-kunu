import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { auth } from "@/server/auth";
import { isAdmin } from "@/lib/admin";
import { DashboardNav } from "@/components/dashboard/DashboardNav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  // Non-admins should not even know /admin exists — 404 rather than redirect.
  if (!session || !isAdmin(session.user.email)) {
    notFound();
  }
  return (
    <>
      <DashboardNav />
      {children}
    </>
  );
}
