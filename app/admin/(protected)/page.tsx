import { ArrowRight, ClipboardList, Clock3, FileCheck2, Images, PencilLine, Plus, Settings2, UserRoundCheck } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { StatusBadge } from "@/app/admin/StatusBadge";
import { formatAdminDate } from "@/app/admin/status";
import { getRequestRepository } from "@/lib/backend/repository";
import { getAdminSession } from "@/lib/backend/auth";
import styles from "../admin.module.css";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session=await getAdminSession();
  if (!session) redirect("/admin/login");
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
        <div><span>Resumen operativo</span><h1>Tu centro de gestión</h1><p>Revisa pendientes, atiende clientes y mantén tu negocio al día.</p></div>
        <Link className={styles.primaryAction} href="/admin/solicitudes">Abrir bandeja <ArrowRight size={17} /></Link>
      </section>

      <section className={styles.metricGrid} aria-label="Indicadores de solicitudes">
        {cards.map(({ label, value, icon: Icon }) => <article key={label}><span><Icon size={19} /></span><div><small>{label}</small><strong>{value}</strong></div></article>)}
      </section>

      <section className={styles.quickSection} aria-labelledby="quick-actions-title">
        <header><div><span>Acciones rápidas</span><h2 id="quick-actions-title">Continúa con una tarea</h2></div><p>Accesos directos a las operaciones más frecuentes del panel.</p></header>
        <div className={styles.quickGrid}>
          <Link href="/admin/cotizaciones/nueva"><span><Plus size={19} /></span><div><b>Nueva cotización</b><small>Prepara una proforma para un cliente</small></div><ArrowRight size={16} /></Link>
          {session.role!=="COMMERCIAL" && <Link href="/admin/configuracion/cotizador"><span><Settings2 size={19} /></span><div><b>Gestionar cotizador</b><small>Modelos, imágenes, preguntas y precios</small></div><ArrowRight size={16} /></Link>}
          {session.role!=="COMMERCIAL" && <Link href="/admin/contenido/inicio"><span><PencilLine size={19} /></span><div><b>Editar página de Inicio</b><small>Actualiza textos y secciones públicas</small></div><ArrowRight size={16} /></Link>}
          {session.role!=="COMMERCIAL" && <Link href="/admin/contenido/biblioteca"><span><Images size={19} /></span><div><b>Biblioteca de medios</b><small>Sube y administra imágenes o videos</small></div><ArrowRight size={16} /></Link>}
        </div>
      </section>

      <section className={styles.panel}>
        <header className={styles.panelHeader}><div><h2>Solicitudes recientes</h2><p>{stats.total} registradas en total</p></div><Link href="/admin/solicitudes">Ver todas <ArrowRight size={15} /></Link></header>
        {recent.items.length ? (
          <div className={styles.tableWrap}><table className={styles.table}>
            <thead><tr><th>Código</th><th>Cliente</th><th>Proyecto</th><th>Estado</th><th>Fecha</th><th /></tr></thead>
            <tbody>{recent.items.map((request) => <tr key={request.id}>
              <td data-label="Código"><b>{request.code}</b></td>
              <td data-label="Cliente"><strong>{request.contact.name}</strong><small>{request.contact.phone}</small></td>
              <td data-label="Proyecto"><span>{request.details.projectType}</span><small>{request.details.location}</small></td>
              <td data-label="Estado"><StatusBadge status={request.status} /></td>
              <td data-label="Fecha">{formatAdminDate(request.createdAt)}</td>
              <td data-action><Link className={styles.rowAction} href={`/admin/solicitudes/${request.id}`} aria-label={`Abrir ${request.code}`}><ArrowRight size={16} /></Link></td>
            </tr>)}</tbody>
          </table></div>
        ) : <div className={styles.emptyState}><ClipboardList size={28} /><h2>No hay solicitudes registradas</h2><p>Las consultas de tus clientes aparecerán aquí.</p></div>}
      </section>
    </>
  );
}
