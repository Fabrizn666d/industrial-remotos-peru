import { FileText, Plus, Search } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { QuoteRowActions } from "@/app/admin/QuoteRowActions";
import { QuoteStatusBadge } from "@/app/admin/QuoteStatusBadge";
import { getAdminSession } from "@/lib/backend/auth";
import { formatPen } from "@/lib/control/quote-calculations";
import { QuoteStatusSchema, type QuoteStatus } from "@/lib/control/quote-contracts";
import { getControlQuoteRepository } from "@/lib/control/repository";
import styles from "../../admin.module.css";

export const dynamic = "force-dynamic";

type SearchParams = { query?: string | string[]; status?: string | string[] };

function single(value: string | string[] | undefined) {
  return typeof value === "string" ? value : undefined;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-PE", { dateStyle: "medium", timeZone: "UTC" }).format(new Date(`${value}T12:00:00Z`));
}

const labels: Record<QuoteStatus, string> = { DRAFT: "Borrador", ISSUED: "Emitida", VOID: "Anulada" };

export default async function QuotesPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  if (!await getAdminSession()) redirect("/admin/login");
  const values = await searchParams;
  const query = (single(values.query) || "").trim().slice(0, 120);
  const parsedStatus = QuoteStatusSchema.safeParse(single(values.status));
  const status = parsedStatus.success ? parsedStatus.data : undefined;
  const result = await getControlQuoteRepository().listQuotes({ query: query || undefined, status, limit: 100, offset: 0 });

  return (
    <>
      <section className={styles.pageHeading}>
        <div><span>IRP Control</span><h1>Cotizaciones</h1><p>Crea, edita, emite y descarga proformas dinámicas en soles.</p></div>
        <Link className={styles.primaryAction} href="/admin/cotizaciones/nueva"><Plus size={17} /> Nueva cotización</Link>
      </section>
      <section className={styles.panel}>
        <form className={styles.filters} method="get">
          <label><Search size={16} /><input name="query" defaultValue={query} placeholder="Código, cliente, documento o proyecto" /></label>
          <select name="status" defaultValue={status || ""} aria-label="Filtrar por estado">
            <option value="">Todos los estados</option>
            {QuoteStatusSchema.options.map((value) => <option value={value} key={value}>{labels[value]}</option>)}
          </select>
          <button type="submit">Filtrar</button>
          {(query || status) && <Link href="/admin/cotizaciones">Limpiar</Link>}
        </form>
        <div className={styles.resultCount}><b>{result.total}</b> cotizaciones encontradas</div>
        {result.items.length ? <div className={styles.quoteTableWrap}><table className={styles.table}>
          <thead><tr><th>Código</th><th>Cliente</th><th>Proyecto</th><th>Fecha</th><th>Total</th><th>Estado</th><th /></tr></thead>
          <tbody>{result.items.map((quote) => <tr key={quote.id}>
            <td><b>{quote.code}</b></td>
            <td><strong>{quote.client.name}</strong><small>{quote.client.documentNumber || quote.client.phone || "Sin documento"}</small></td>
            <td><span>{quote.project.name}</span><small>{quote.project.location}</small></td>
            <td>{formatDate(quote.issueDate)}</td>
            <td><strong>{formatPen(quote.totals.totalMinor)}</strong></td>
            <td><QuoteStatusBadge status={quote.status} /></td>
            <td><QuoteRowActions id={quote.id} code={quote.code} status={quote.status} /></td>
          </tr>)}</tbody>
        </table></div> : <div className={styles.emptyState}><FileText size={30} /><h2>Aún no hay cotizaciones</h2><p>Crea el primer borrador y agrega un producto del catálogo de cotización.</p><Link className={styles.primaryAction} href="/admin/cotizaciones/nueva"><Plus size={16} /> Nueva cotización</Link></div>}
      </section>
    </>
  );
}

