import { ArrowRight, ClipboardList, Clock3, FileCheck2, UserRoundCheck } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { StatusBadge } from "@/app/admin/StatusBadge";
import { formatAdminDate } from "@/app/admin/status";
import { getRequestRepository } from "@/lib/backend/repository";
import { getAdminSession } from "@/lib/backend/auth";
import styles from "../admin.module.css";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  if (!await getAdminSession()) redirect("/admin/login");
  const repository = getRequestRepository();
  const [stats, recent] = await Promise.all([
    repository.dashboardStats(),
    repository.list({ limit: 6, offset: 0 })
  ]);

  const cards = [
    { label: "Solicitudes nuevas", value: stats.new, icon: ClipboardList },
    { label: "En revisión", value: stats.inReview, icon: Clock3 },
    { label: "Cotizadas", value: stats.quoted, icon: FileCheck2 },
    { label: "Aprobadas", value: stats.approved, icon: UserRoundCheck }
  ];

  return (
    <>
      <section className={styles.pageHeading}>
        <div><span>Resumen operativo</span><h1>Dashboard</h1><p>Solicitudes registradas en el backend y pendientes de atención comercial.</p></div>
        <Link className={styles.primaryAction} href="/admin/solicitudes">Abrir bandeja <ArrowRight size={17} /></Link>
      </section>

      <section className={styles.metricGrid} aria-label="Indicadores de solicitudes">
        {cards.map(({ label, value, icon: Icon }) => <article key={label}><span><Icon size={19} /></span><div><small>{label}</small><strong>{value}</strong></div></article>)}
      </section>

      <section className={styles.panel}>
        <header className={styles.panelHeader}><div><h2>Solicitudes recientes</h2><p>{stats.total} registradas en total</p></div><Link href="/admin/solicitudes">Ver todas <ArrowRight size={15} /></Link></header>
        {recent.items.length ? (
          <div className={styles.tableWrap}><table className={styles.table}>
            <thead><tr><th>Código</th><th>Cliente</th><th>Proyecto</th><th>Estado</th><th>Fecha</th><th /></tr></thead>
            <tbody>{recent.items.map((request) => <tr key={request.id}>
              <td><b>{request.code}</b></td>
              <td><strong>{request.contact.name}</strong><small>{request.contact.phone}</small></td>
              <td><span>{request.details.projectType}</span><small>{request.details.location}</small></td>
              <td><StatusBadge status={request.status} /></td>
              <td>{formatAdminDate(request.createdAt)}</td>
              <td><Link className={styles.rowAction} href={`/admin/solicitudes/${request.id}`} aria-label={`Abrir ${request.code}`}><ArrowRight size={16} /></Link></td>
            </tr>)}</tbody>
          </table></div>
        ) : <div className={styles.emptyState}><ClipboardList size={28} /><h2>No hay solicitudes registradas</h2><p>La primera solicitud válida enviada a la API aparecerá aquí.</p></div>}
      </section>
    </>
  );
}
