import { redirect } from "next/navigation";
import { LoginForm } from "@/app/admin/login/LoginForm";
import { getAdminSession } from "@/lib/backend/auth";
import styles from "../admin.module.css";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  if (await getAdminSession()) redirect("/admin");
  const requestedDestination = (await searchParams).next;
  const destination = requestedDestination?.startsWith("/admin") && !requestedDestination.startsWith("/admin/login")
    ? requestedDestination
    : "/admin";

  return <main className={styles.loginPage}><div className={styles.loginBackdrop} /><LoginForm destination={destination} /></main>;
}
