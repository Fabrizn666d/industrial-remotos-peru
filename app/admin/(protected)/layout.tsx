import { redirect } from "next/navigation";
import { AdminShell } from "@/app/admin/AdminShell";
import { getAdminSession } from "@/lib/backend/auth";

export const dynamic = "force-dynamic";

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return <AdminShell session={session}>{children}</AdminShell>;
}
