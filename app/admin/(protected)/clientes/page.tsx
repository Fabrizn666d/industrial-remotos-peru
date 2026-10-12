import { ArrowRight, UsersRound } from "lucide-react";
import Link from "next/link";
import { getRequestRepository } from "@/lib/backend/repository";
import styles from "../../admin.module.css";

export const dynamic = "force-dynamic";

export default async function AdminClientsPage() {
  const repository = getRequestRepository();
  const first = await repository.list({ limit: 100, offset: 0 });
  const pages = [first];
  for (let offset = 100; offset < Math.min(first.total, 1000); offset += 100) pages.push(await repository.list({ limit: 100, offset }));
  const requests = pages.flatMap((page) => page.items);
  const clients = new Map<string, { name: string; email: string; phone: string; document: string; count: number; latest: string; requestId: string }>();
  for (const request of requests) {
    const key = request.contact.email.toLowerCase();
    const current = clients.get(key);
    if (!current) clients.set(key, { name: request.contact.name, email: request.contact.email, phone: request.contact.phone, document: [request.contact.documentType, request.contact.documentNumber].filter(Boolean).join(" "), count: 1, latest: request.createdAt, requestId: request.id });
    else { current.count += 1; if (request.createdAt > current.latest) { current.latest = request.createdAt; current.requestId = request.id; current.name = request.contact.name; current.phone = request.contact.phone; } }
  }
  const rows = [...clients.values()].sort((a, b) => b.latest.localeCompare(a.latest));
  return <><section className={styles.pageHeading}><div><span>Comercial</span><h1>Clientes</h1><p>Vista consolidada desde las solicitudes registradas, sin duplicar datos personales.</p></div></section><section className={styles.panel}><div className={styles.resultCount}><b>{rows.length}</b> clientes en {requests.length} solicitudes consultadas</div>{rows.length ? <div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>Cliente</th><th>Contacto</th><th>Documento</th><th>Solicitudes</th><th>Última actividad</th><th /></tr></thead><tbody>{rows.map((client) => <tr key={client.email}><td><strong>{client.name}</strong><small>{client.email}</small></td><td>{client.phone}</td><td>{client.document || "No indicado"}</td><td>{client.count}</td><td>{new Intl.DateTimeFormat("es-PE", { dateStyle: "medium", timeStyle: "short" }).format(new Date(client.latest))}</td><td><Link className={styles.rowAction} href={`/admin/solicitudes/${client.requestId}`} aria-label={`Abrir solicitud de ${client.name}`}><ArrowRight size={16} /></Link></td></tr>)}</tbody></table></div> : <div className={styles.emptyState}><UsersRound size={28} /><h2>Todavía no hay clientes</h2><p>Aparecerán cuando se registre una solicitud.</p></div>}</section></>;
}
