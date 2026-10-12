import { Activity } from "lucide-react";
import { listCmsActivity } from "@/lib/cms/content-repository";
import styles from "../../admin.module.css";

const labels = { home: "Inicio", about: "Nosotros", services: "Servicios", projects: "Proyectos", contact: "Contacto", company: "Empresa y contacto", footer: "Footer y legal" } as const;
export const dynamic = "force-dynamic";

export default async function AdminActivityPage() {
  const items = await listCmsActivity(200);
  return <><section className={styles.pageHeading}><div><span>Sistema</span><h1>Actividad</h1><p>Historial real de publicaciones realizadas desde el editor de contenido.</p></div></section><section className={styles.panel}>{items.length ? <div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>Fecha</th><th>Usuario</th><th>Contenido</th><th>Versión</th><th>Acción</th></tr></thead><tbody>{items.map((item) => <tr key={item.id}><td>{new Intl.DateTimeFormat("es-PE", { dateStyle: "medium", timeStyle: "short" }).format(new Date(item.createdAt))}</td><td><strong>{item.actor}</strong></td><td>{labels[item.key]}</td><td>{item.version || "—"}</td><td>{item.summary}</td></tr>)}</tbody></table></div> : <div className={styles.emptyState}><Activity size={28} /><h2>Sin actividad registrada</h2><p>Los guardados del CMS aparecerán aquí.</p></div>}</section></>;
}
