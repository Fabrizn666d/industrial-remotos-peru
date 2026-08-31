import { ArrowLeft, ArrowRight, ClipboardList, Search } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { StatusBadge } from "@/app/admin/StatusBadge";
import { formatAdminDate, REQUEST_STATUS_LABELS } from "@/app/admin/status";
import { RequestStatusSchema, type RequestStatus } from "@/lib/backend/contracts";
import { getRequestRepository } from "@/lib/backend/repository";
import { getAdminSession } from "@/lib/backend/auth";
import styles from "../../admin.module.css";

export const dynamic = "force-dynamic";

type SearchParams = { query?: string | string[]; status?: string | string[]; page?: string | string[] };
const PAGE_SIZE = 25;

function single(value: string | string[] | undefined) {
  return typeof value === "string" ? value : undefined;
}

function pageHref(page: number, query?: string, status?: RequestStatus) {
  const params = new URLSearchParams();
  if (query) params.set("query", query);
  if (status) params.set("status", status);
  if (page > 1) params.set("page", String(page));
  const suffix = params.toString();
  return `/admin/solicitudes${suffix ? `?${suffix}` : ""}`;
}

export default async function AdminRequestsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  if (!await getAdminSession()) redirect("/admin/login");
  const values = await searchParams;
  const query = (single(values.query) || "").trim().slice(0, 120);
  const parsedStatus = RequestStatusSchema.safeParse(single(values.status));
  const status = parsedStatus.success ? parsedStatus.data : undefined;
  const rawPage = Number(single(values.page) || 1);
  const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;
  const result = await getRequestRepository().list({ query: query || undefined, status, limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE });
  const lastPage = Math.max(1, Math.ceil(result.total / PAGE_SIZE));

  return (
    <>
      <section className={styles.pageHeading}><div><span>Cotizaciones</span><h1>Solicitudes</h1><p>El snapshot original se conserva separado de la operación comercial.</p></div></section>
      <section className={styles.panel}>
        <form className={styles.filters} method="get">
          <label><Search size={16} /><input name="query" defaultValue={query} placeholder="Código, cliente, teléfono o ubicación" /></label>
          <select name="status" defaultValue={status || ""} aria-label="Filtrar por estado">
            <option value="">Todos los estados</option>
            {RequestStatusSchema.options.map((value) => <option value={value} key={value}>{REQUEST_STATUS_LABELS[value]}</option>)}
          </select>
          <button type="submit">Filtrar</button>
          {(query || status) && <Link href="/admin/solicitudes">Limpiar</Link>}
        </form>

        <div className={styles.resultCount}><b>{result.total}</b> solicitudes encontradas</div>
        {result.items.length ? <div className={styles.tableWrap}><table className={styles.table}>
          <thead><tr><th>Código</th><th>Cliente</th><th>Proyecto</th><th>Estado</th><th>Origen</th><th>Fecha</th><th /></tr></thead>
          <tbody>{result.items.map((request) => <tr key={request.id}>
            <td><b>{request.code}</b></td>
            <td><strong>{request.contact.name}</strong><small>{request.contact.email}</small></td>
            <td><span>{request.details.projectType}</span><small>{request.details.location}</small></td>
            <td><StatusBadge status={request.status} /></td>
            <td>{request.source === "CONFIGURATOR" ? "Configurador" : request.source === "CONTACT" ? "Contacto" : "Importación"}</td>
            <td>{formatAdminDate(request.createdAt)}</td>
            <td><Link className={styles.rowAction} href={`/admin/solicitudes/${request.id}`}><ArrowRight size={16} /></Link></td>
          </tr>)}</tbody>
        </table></div> : <div className={styles.emptyState}><ClipboardList size={28} /><h2>Sin resultados</h2><p>Ajusta la búsqueda o espera una nueva solicitud.</p></div>}

        {lastPage > 1 && <nav className={styles.pagination} aria-label="Paginación">
          {page > 1 ? <Link href={pageHref(page - 1, query, status)}><ArrowLeft size={15} /> Anterior</Link> : <span />}
          <small>Página {Math.min(page, lastPage)} de {lastPage}</small>
          {page < lastPage ? <Link href={pageHref(page + 1, query, status)}>Siguiente <ArrowRight size={15} /></Link> : <span />}
        </nav>}
      </section>
    </>
  );
}
