import { ArrowLeft, ArrowRight, BookOpenCheck, Search } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/backend/auth";
import { ComplaintStatusSchema, listComplaints, type ComplaintStatus } from "@/lib/complaints";
import { formatAdminDate } from "@/app/admin/status";
import styles from "../../admin.module.css";

export const dynamic = "force-dynamic";
const PAGE_SIZE = 25;
const labels: Record<ComplaintStatus, string> = { RECEIVED: "Recibido", IN_REVIEW: "En revisión", ANSWERED: "Respondido", CLOSED: "Cerrado" };
type SearchParams = { query?: string | string[]; status?: string | string[]; page?: string | string[] };
const single = (value: string | string[] | undefined) => typeof value === "string" ? value : undefined;
function href(page: number, query?: string, status?: ComplaintStatus) { const params = new URLSearchParams(); if (query) params.set("query", query); if (status) params.set("status", status); if (page > 1) params.set("page", String(page)); return `/admin/reclamos${params.size ? `?${params}` : ""}`; }

export default async function ComplaintsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  if (!await getAdminSession()) redirect("/admin/login");
  const values = await searchParams;
  const query = (single(values.query) || "").trim().slice(0, 120);
  const parsed = ComplaintStatusSchema.safeParse(single(values.status));
  const status = parsed.success ? parsed.data : undefined;
  const rawPage = Number(single(values.page) || 1); const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;
  const result = await listComplaints({ query, status, limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE });
  const lastPage = Math.max(1, Math.ceil(result.total / PAGE_SIZE));
  return <><section className={styles.pageHeading}><div><span>Atención al consumidor</span><h1>Libro de Reclamaciones</h1><p>Consulta el registro original y gestiona su estado de atención.</p></div></section><section className={styles.panel}>
    <form className={styles.filters} method="get"><label><Search size={16} /><input name="query" defaultValue={query} placeholder="Código, consumidor o documento" /></label><select name="status" defaultValue={status || ""}><option value="">Todos los estados</option>{ComplaintStatusSchema.options.map((value) => <option value={value} key={value}>{labels[value]}</option>)}</select><button type="submit">Filtrar</button>{(query || status) && <Link href="/admin/reclamos">Limpiar</Link>}</form>
    <div className={styles.resultCount}><b>{result.total}</b> registros encontrados</div>
    {result.items.length ? <div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>Código</th><th>Consumidor</th><th>Tipo</th><th>Estado</th><th>Fecha</th><th /></tr></thead><tbody>{result.items.map((item) => <tr key={item.id}><td><b>{item.code}</b></td><td><strong>{item.consumer.name}</strong><small>{item.consumer.documentType}: {item.consumer.documentNumber}</small></td><td>{item.type === "RECLAMO" ? "Reclamo" : "Queja"}</td><td><span className={`${styles.statusBadge} ${styles[`complaint_${item.status}`]}`}>{labels[item.status]}</span></td><td>{formatAdminDate(item.createdAt)}</td><td><Link className={styles.rowAction} href={`/admin/reclamos/${item.id}`}><ArrowRight size={16} /></Link></td></tr>)}</tbody></table></div> : <div className={styles.emptyState}><BookOpenCheck size={28} /><h2>Sin registros</h2><p>No hay reclamos que coincidan con los filtros.</p></div>}
    {lastPage > 1 && <nav className={styles.pagination}>{page > 1 ? <Link href={href(page - 1, query, status)}><ArrowLeft size={15} />Anterior</Link> : <span />}<small>Página {Math.min(page, lastPage)} de {lastPage}</small>{page < lastPage ? <Link href={href(page + 1, query, status)}>Siguiente<ArrowRight size={15} /></Link> : <span />}</nav>}
  </section></>;
}
